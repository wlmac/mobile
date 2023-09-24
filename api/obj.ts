
// Types

import { AxiosRequestConfig } from 'axios';
import { ID, Nullable, URLString, anyObject, LimitOffsetPagination } from './misc';
import { axiosInstance } from './core';
import { Session } from '../util/session';

export type ObjectType = "tag" | "organization" | "comment" | "banner" | "news" |
                  "announcement" | "blog-post" | "event" | "flatpage" | "user";

export interface Requestor<T> {
    id: null extends T ? Nullable<ID<T>> : ID<T>;

    type: "id" | "nullable-id";

    (): Promise<T>;

    /**
     * Gets the cached object directly.
     * As the object may not be cached, this method can return undefined.
     * Use with caution.
     */
    getUnchecked(): T | undefined;
};

export class Handler<T extends IDObject<T>, U extends IDDescriptor<U, T> = any>{
    // Used for saving and loading from AsyncStorage
    public static readonly ALL_HANDLERS: Handler<any, any>[] = [];

    public readonly type: ObjectType;
    readonly object: { new(handler: Handler<T, U>, data: anyObject): T };
    readonly descriptor?: { new(handler: Handler<T, U>, data: anyObject): U };

    readonly _cache = new Map<ID<T>, T>();

    private isErrored = false;

    constructor(type: ObjectType, object: { new(handler: Handler<T, U>, data: anyObject): T }, descriptor?: { new(handler: Handler<T, U>, data: anyObject): U }){
        this.type = type;
        this.object = object;
        this.descriptor = descriptor;

        Handler.ALL_HANDLERS.push(this);
    }

    async get(id: ID<T>, update: boolean = false): Promise<T>{
        if(!update && this._cache.has(id))
            return this._cache.get(id)!;

        try{
            const req = await axiosInstance.get(`/v3/obj/${this.type}/retrieve/${id}/`);
            const obj = new this.object(this, req.data);
            this.addToCache(obj);

            this.isErrored = false;
            return obj;
        }catch(err){
            this.isErrored = true;
            throw err;
        }
    }

    getUnchecked(id: ID<T>): T | undefined {
        return this._cache.get(id);
    }

    processDescriptor(data: anyObject): U | undefined {
        if(!this.descriptor){
            throw Error(`Handler ${this.type} does not have a descriptor`);
        }
        const obj = new this.descriptor(this, data);
        return obj;
    }

    addToCache(obj: T){
        if(obj.cacheHasMoreData()){
            return;
        }
        this._cache.set(obj.id, obj);
    }

    fromRawData(data: anyObject){
        const obj = new this.object(this, data);
        this.addToCache(obj);
        return obj;
    }

    async *list(session: Session, limit=50, offset=0, options: AxiosRequestConfig<LimitOffsetPagination<T>> = {}): AsyncIterableIterator<T> {
        if(["comment", "flatpage"].includes(this.type))
            throw new Error(`Cannot list ${this.type} objects`);
        
        options = {
            ...options,
            params: {
                ...options.params,
                limit,
                offset,
            }
        };

        try{
            let url: URLString | null = `v3/obj/${this.type}`;
            do{
                let response: LimitOffsetPagination<T> = (await axiosInstance.get<LimitOffsetPagination<T>>(url, options)).data;
                for(const data of response.results)
                    yield this.fromRawData(data);
                url = response.next;
            }while(url !== null);

            this.isErrored = false;
        }catch(err){
            this.isErrored = true;
            throw err;
        }
    }

    *listCached(){
        for(const obj of this._cache.values())
            yield obj;
    }


    errored(){
        return this.isErrored
    }
}

export abstract class IDObject<T extends IDObject<T>>{
    readonly handler: Handler<T, any>;
    readonly id: ID<T>;
    public fetched: boolean = false;

    public constructor(handler: Handler<T, any>, data: anyObject, fromCache: boolean = false){
        this.handler = handler;
        this.id = data.id;

        if(!fromCache){
            Object.assign(this, this.preprocess(data));
        }else{
            for(const key in data){
                if(!data[key]._requestorType){
                    if(Array.isArray(data[key]) && data[0]._isRequestor){
                        (this as any)[key] = this.createIDRequestorArray(data[key], handler);
                        continue;
                    }
                    (this as any)[key] = data[key];
                    continue;
                }
                if(data[key]._requestorType === "id"){
                    (this as any)[key] = this.createIDRequestor(data[key].id, handler);
                }else if(data[key]._requestorType === "nullable-id"){
                    (this as any)[key] = this.createNullableIDRequestor(data[key].id, handler);
                }
            }
        }
    }

    protected preprocess(data: anyObject){
        return data;
    }

    public static getHandler(): Handler<any, any | never>{
        throw new Error("getHandler() method must be overridden"); // Typescript doesn't allow abstract static methods
    }

    /**
     * Fetches the object from the backend and assigns the data to this object.
     * This is used when the object was fetched from a list endpoint and not a retrieve endpoint
     */
    protected async fetch(){
        if(this.fetched)
            return;
        const data = await this.handler.get(this.id);
        Object.assign(this, this.preprocess(data));
        this.fetched = true;
    }

    // Helper functions
    protected createIDRequestor<T extends IDObject<T>, B extends undefined | never = never>(id: ID<T> | anyObject | B, handler: Handler<T, any>): Requestor<T> | B {
        if(id === undefined)
            return undefined!;
        if(typeof id === "object"){
            const obj = new handler.object(handler, id);
            handler.addToCache(obj);
            id = id.id;
        }
        const requestor = async() => {
            return await handler.get(id as ID<T>);
        };
        requestor.id = id as ID<T>;
        requestor.getUnchecked = () => handler.getUnchecked(id as ID<T>);
        requestor.type = "id" as "id";

        return requestor;
    }
    protected createNullableIDRequestor<T extends IDObject<T>, B extends undefined | never = never>(id: Nullable<ID<T> | anyObject> | B, handler: Handler<T, any>): Requestor<Nullable<T>> | B {
        if(id === null){
            const requestor = async() => null;
            requestor.id = null as any;
            requestor.getUnchecked = () => null;
            requestor.type = "nullable-id" as "nullable-id";
            return requestor;
        }
        
        return this.createIDRequestor<T, B>(id, handler) as Requestor<Nullable<T>>;
    }

    protected createIDRequestorArray<T extends IDObject<T>, B extends undefined | never = never>(ids: (ID<T> | anyObject)[] | B, handler: Handler<T, any>): Requestor<T>[] | B{
        if(ids === undefined)
            return undefined!;
        return ids.map(id => this.createIDRequestor<T, never>(id, handler));
    }

    protected createDescriptor<U extends IDDescriptor<U, any>, B extends undefined | never = never>(obj: anyObject | B, handler: Handler<any, U>): U | B {
        if(obj === undefined)
            return undefined!;

        return handler.processDescriptor(obj)!;
    }
    protected createDescriptorArray<U extends IDDescriptor<U, any>, B extends undefined | never = never>(objs: anyObject[] | B, handler: Handler<any, U>): U[] | B {
        if(objs === undefined)
            return undefined!;
        
        return objs.map(obj => this.createDescriptor<U, any>(obj, handler));
    }
    
    cacheHasMoreData(): boolean {

        const cached = this.handler._cache.get(this.id)!;

        if(!cached || this == cached as any)
            return false;

        const cachedKeys = Object.keys(cached);
        const thisKeys = Object.keys(this);

        const cachedKeysHas = cachedKeys.filter(x => !thisKeys.includes(x)).length > 0;
        const thisKeysHas = thisKeys.filter(x => !cachedKeys.includes(x)).length > 0;
        if(cachedKeysHas && !thisKeysHas) // Sanity check
            throw new Error("Object contains different data than cached object");
        
        if(cachedKeysHas)
            return true;
        
        return false;
    }
}

export abstract class IDDescriptor<T extends IDDescriptor<T, U>, U extends IDObject<U>> extends IDObject<U>{
    getObject!: Requestor<T>;

    protected preprocess(data: anyObject): anyObject {
        const { id, ...rest } = super.preprocess(data);
        this.getObject = this.createIDRequestor(id, this.handler);
        return rest;
    }
}