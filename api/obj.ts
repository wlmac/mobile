
// Types

import { AxiosRequestConfig } from 'axios';
import { ID, Nullable, URLString, anyObject, LimitOffsetPagination } from './misc';
import { axiosInstance } from './core';

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

export class Handler<T extends IDObject<T>>{
    // Used for saving and loading from AsyncStorage
    public static readonly ALL_HANDLERS: Handler<any>[] = [];

    public readonly type: ObjectType;
    readonly object: { new(handler: Handler<T>, data: anyObject): T };

    readonly _cache = new Map<ID<T>, T>();

    private isErrored = false;

    constructor(type: ObjectType, clazz: { new(handler: Handler<T>, data: anyObject): T }){
        this.type = type;
        this.object = clazz;

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

    addToCache(obj: T){
        if(obj.cacheHasMoreData()){
            return;
        }
        this._cache.set(obj.id, obj);
    }

    protected create(data: anyObject){
        const obj = new this.object(this, data);
        this.addToCache(obj);
        return obj;
    }

    async *list(limit=50, offset=0, options: AxiosRequestConfig<LimitOffsetPagination<T>> = {}): AsyncIterableIterator<T> {
        if(["comment", "flatpage"].includes(this.type))
            throw new Error(`Cannot list ${this.type} objects`);
        
        try{
            let url: URLString | null = `v3/obj/${this.type}?limit=${limit}&offset=${offset}`;
            do{
                let response: LimitOffsetPagination<T> = (await axiosInstance.get<LimitOffsetPagination<T>>(url, options)).data;
                for(const data of response.results)
                    yield this.create(data);
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
        return this.isErrore
    }
}

export abstract class IDObject<T extends IDObject<T>>{
    readonly handler: Handler<T>;
    readonly id: ID<T>;
    public fetched: boolean = false;

    public constructor(handler: Handler<T>, data: anyObject, fromCache: boolean = false){
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

    public static getHandler(): Handler<any>{
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
    protected createIDRequestor<U extends IDObject<U>, B extends undefined | never = never>(id: ID<U> | anyObject | B, handler: Handler<U>): Requestor<U> | B {
        if(id === undefined)
            return undefined!;
        if(typeof id === "object"){
            // const obj = new handler.object(handler, id);
            // handler.addToCache(obj);
            id = id.id;
        }
        const requestor = async() => {
            return await handler.get(id as ID<U>);
        };
        requestor.id = id as ID<U>;
        requestor.getUnchecked = () => handler.getUnchecked(id as ID<U>);
        requestor.type = "id" as "id";

        return requestor;
    }
    protected createNullableIDRequestor<U extends IDObject<U>, B extends undefined | never = never>(id: Nullable<ID<U> | anyObject> | B, handler: Handler<U>): Requestor<Nullable<U>> | B {
        if(id === null){
            const requestor = async() => null;
            requestor.id = null as any;
            requestor.getUnchecked = () => null;
            requestor.type = "nullable-id" as "nullable-id";
            return requestor;
        }
        
        return this.createIDRequestor<U, B>(id, handler) as Requestor<Nullable<U>>;
    }
    protected createIDRequestorArray<U extends IDObject<U>, B extends undefined | never = never>(ids: (ID<U> | anyObject)[] | B, handler: Handler<U>): Requestor<U>[] | B{
        if(ids === undefined)
            return undefined!;
        return ids.map(id => this.createIDRequestor<U, never>(id, handler));
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

/*

below is bad code but kept for reference


// https://www.django-rest-framework.org/api-guide/pagination/#limitoffsetpagination

// Types for different apis

const OBJ_NAMES_ARRAY: ObjectType[] = ["tag", "organization", "comment", "banner", "news";
                                       "announcement", "blog-post", "event", "flatpage", "user"]

type KeyMapToWrapper<T> = { [key in keyof T]: key extends Requestor<infer U> ? RequestorObjectWrapper<U> : never };
type KeyArray<T> = Exclude<keyof T, keyof KeyMapToWrapper<T>>[];

class RequestorObjectWrapper<T>{
    private readonly TYPE: ObjectType;

    private cache: Map<Requestor<T>, T> = new Map();
    
    private readonly props: KeyArray<T>;
    private readonly idProps: KeyMapToWrapper<T>;
    private readonly idArrayProps: KeyMapToWrapper<T>;

    constructor(type: ObjectType, props: KeyArray<T>, idProps: KeyMapToWrapper<T>, idArrayProps: KeyMapToWrapper<T>){
        this.TYPE = type;

        this.props = props;
        this.idProps = idProps;
        this.idArrayProps = idArrayProps;
    }

    async get(id: Requestor<T>): Promise<T>{
        if(this.cache.has(id))
            return this.cache.get(id) as T;
        const res = await axiosInstance.get<T>(`/v3/obj/${this.TYPE}/retrieve/${id}/`);
        const data = res.data;
        const obj: any = {};

        for(const prop of this.props)
            obj[prop] = data[prop];
        
        for(const prop in this.idProps){
            Object.defineProperty(obj, prop, {
                get: () => this.idProps[prop].get(data[prop])
            });
        }

        this.cache.set(id, data);
        return data;
    }
}

// helper function
function convertIdArrayToProxyArray<T extends {[key: string]: any}>(array: Requestor<T>[], proxy: RequestorProxy<T>){
    return array.map((id) => proxy.create(id));
}

// Data types

interface _TagData{
    name: string;
    color: string
}
export type TagData = WrapType<_TagData>;
const TagProxy = new RequestorProxy<_TagData>("tag");

interface _NewsData{
    author: UserData;
    created_date: DateTimeString;
    last_modified_date: DateTimeString;
    title: string;
    body: string;
    tags: TagData[];
    likes: number;
    comments: CommentDescriptor[];
}
export type NewsData = WrapType<_NewsData>;
const NewsProxy = new RequestorProxy<_NewsData>("news", (data) => {
    data.author = UserProxy.create(data.author);
    data.tags = convertIdArrayToProxyArray(data.tags, TagProxy);
    return data;
});

interface _AnnouncementData{
    show_after: DateTimeString;
    is_public: boolean;
    status: "d" | "p" | "a" | "r";
    rejection_reason: string;
    organization: Requestor<OrganizationData>;
    supervisor: Nullable<Requestor<UserData>>;
}
export type AnnouncementData = WrapType<_AnnouncementData>;
const AnnouncementProxy = new RequestorProxy<_AnnouncementData>("announcement", (data) => {
    data.organization = OrganizationProxy.create(data.organization);
    if(data.supervisor !== null)
        data.supervisor = UserProxy.create(data.supervisor);
    return data;
});

interface _BlogPostData{
    slug: string;
    views: number;
    featured_image: URLString;
    featured_image_description: string;
    is_published: boolean;
}
export type BlogPostData = WrapType<_BlogPostData>
const BlogPostProxy = new RequestorProxy<_BlogPostData>("blog-post");

interface _EventData{
    name: string;
    description: string;
    term: TermType;
    organization: Requestor<OrganizationData>;
    time: {
        start: DateTimeString;
        end: DateTimeString;
    };
    scheduleFormat: number;
    instructional: number;
    is_public: boolean;
    tags: Requestor<TagData>[];
}
export type EventData = WrapType<_EventData>;
const EventProxy = new RequestorProxy<_EventData>("event", (data) => {
    data.organization = OrganizationProxy.create(data.organization);
    data.tags = convertIdArrayToProxyArray(data.tags, TagProxy);
    return data;
});

interface _UserData{
    username: string;
    first_name: string;
    last_name: string;
    graduating_year: number;
    email_hash: Base64String;
    gravatar_url: URLString;

    bio: string;
    timezone: TimezoneString;
    organizations: Requestor<OrganizationData>[];
    following: Requestor<UserData>[];
    saved_blogs: Requestor<BlogPostData>[];
    saved_announcements: Requestor<AnnouncementData>[];
}
export type UserData = WrapType<_UserData>;
const UserProxy = new RequestorProxy<_UserData>("user", (data) => {
    data.organizations = convertIdArrayToProxyArray(data.organizations, OrganizationProxy);
    data.following = convertIdArrayToProxyArray(data.following, UserProxy);
    data.saved_blogs = convertIdArrayToProxyArray(data.saved_blogs, BlogPostProxy);
    data.saved_announcements = convertIdArrayToProxyArray(data.saved_announcements, AnnouncementProxy);
    return data;
});

interface _OrganizationData{
    owner: Requestor<UserData>;
    supervisors: Requestor<UserData>[];
    execs: Requestor<UserData>[];
    members: Requestor<UserData>[];
    name: string;
    bio: string;
    extra_content: string;
    slug: string;
    registered_date: DateTimeString;
    show_members: boolean;
    is_active: boolean;
    is_open: boolean;
    applications_open: boolean;
    tags: Requestor<TagData>[];
    banner: string;
    icon: URLString;
    links: string[];
}
export type OrganizationData = WrapType<_OrganizationData>;
const OrganizationProxy = new RequestorProxy<_OrganizationData>("organization", (data) => {
    data.owner = UserProxy.create(data.owner);
    data.supervisors = convertIdArrayToProxyArray(data.supervisors, UserProxy);
    data.execs = convertIdArrayToProxyArray(data.execs, UserProxy);
    data.members = convertIdArrayToProxyArray(data.members, UserProxy);
    data.tags = convertIdArrayToProxyArray(data.tags, TagProxy);
    return data;
});

interface _CommentData{
    author: Nullable<Requestor<UserData>>;
    body: Nullable<string>;
    created_at: Nullable<DateTimeString>;
    likes: number;
    edited: boolean;
    children: CommentDescriptor[];
}
export type CommentData = WrapType<_CommentData>;
const CommentProxy = new RequestorProxy<_CommentData>("comment", (data) => {
    if(data.author !== null)
        data.author = UserProxy.create(data.author);
    return data;
});

// Unused for now

interface CommentDescriptor{
    id: CommentData;
    has_children: boolean;
    body: Nullable<string>;
    author: Requestor<UserData>;
    likes: number;
}

interface BannerData{
    current: { content: string }[];
    upcoming: { content: string }[];
}


interface FlatpageData{
    slug: string;
    content: string;
}



*/