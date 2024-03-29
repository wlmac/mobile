import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode } from 'react';
import loadResources from '../hooks/useResources';
import * as SplashScreen from 'expo-splash-screen';

export interface Session{
    isLoggedIn?: boolean;
    loginNeeded?: boolean; // TODO document this

    _data: {[key: string]: string | { [key: string]: unknown }} | undefined;

    set(key: string, value: string | { [key: string]: unknown }): void;
    setAll(data: {[key: string]: string | { [key: string]: unknown }}): void;
    get<T>(key: string): T;
    remove(key: string): void;
}

function loadedError(): never{
    throw new Error("Session data not loaded yet");
}

export const SessionContext = React.createContext<Session>({
    _data: undefined,

    set: loadedError,
    setAll: loadedError,
    get: loadedError,
    remove: loadedError,
});

export function SessionProvider(props: { children: ReactNode }) {

    const [ data, setData ] = React.useState<{ [key: string]: string | { [key: string]: unknown } } | undefined>(undefined);
    
    async function load(){
        const loadedData: typeof data = {};

        if(data)
            return true;
        
        const keys = await AsyncStorage.getAllKeys();

        await Promise.allSettled(keys.map(async (key) => {
            const value = await AsyncStorage.getItem(key);
            let data;
            try{
                data = JSON.parse(value ?? "");
            }catch(e){
                data = value;
            }
            loadedData[key] = data;
        }));

        setData(loadedData);
    }

    function set(key: string, value: Exclude<typeof data, undefined>[string]){
        if(data === undefined)
            throw new Error("Session data not loaded yet");

        setData((data) => ({
            ...data,
            [key]: value,
        }));

        AsyncStorage.setItem(key, typeof value == "string" ? value : JSON.stringify(value))
            .catch((e) => console.error("Error writing to async storage:", e));
    }
    
    function setAll(newData: Exclude<typeof data, undefined>) {
        if(data === undefined)
            throw new Error("Session data not loaded yet");

        setData((data) => ({
            ...data,
            ...newData,
        }));

        AsyncStorage.multiSet(Object.entries(newData)
            .map(([key, value]) => [key, typeof value == "string" ? value : JSON.stringify(value)]))
            .catch((e) => console.error("Error writing to async storage:", e));
    }

    function get<T>(key: string): T{
        if(data === undefined)
            throw new Error("Session data not loaded yet");

        return data[key] as T;
    }

    function remove(key: string){
        if(data === undefined)
            throw new Error("Session data not loaded yet");

        setData((data) => data && Object.fromEntries(Object.entries(data).filter(([k]) => k != key)));

        AsyncStorage.removeItem(key);
    }

    /*
    // Only cache certain objects for now
    const CACHED_HANDLERS = [
        Api.TagDataHandler,
        Api.UserDataHandler,
        Api.OrganizationDataHandler,
        Api.EventDataHandler,
    ];
    let cachedObjectsHash = -1; // Quick equality check so we don't write to storage more than we need to
    function cacheObjects(){
        let currObjectsHash = 0;
        for(const handler of CACHED_HANDLERS)
            for(const key of handler._cache.keys())
                currObjectsHash = (currObjectsHash * 101 + key) % 1000000007;
        
        if(currObjectsHash === cachedObjectsHash)
            return;
        
        cachedObjectsHash = currObjectsHash;

        for(const handler of CACHED_HANDLERS){
            const objects = Array.from<Api.IDObject<any>, {[key: string]: any}>(handler._cache.values(), (obj: any) => {
                const objData: {[key: string]: any} = {};
                for(const key of Object.keys(obj)){
                    if(typeof obj[key] === "function"){
                        objData[key] = {
                            _requestorType: obj.type,
                            id: obj.id,
                        }
                    }else{
                        objData[key] = obj[key];
                    }
                }
                return objData;
            });
            set(handler.type + "_cachekey", objects);
        }
    }
    */
   function cacheObjects(){ /* Caching disabled for now */ }

    const session: Session = {
        _data: data,

        set,
        setAll,
        get,
        remove,
    };

    const cachedResourcesHook = loadResources(session);

    session.loginNeeded = cachedResourcesHook.loginNeeded;
    
    React.useEffect(() => {
        SplashScreen.preventAutoHideAsync();

        load();
    }, []);
    
    React.useEffect(() => {
        if(data != undefined || !cachedResourcesHook.isLoadingComplete)
            return;

        SplashScreen.hideAsync();
        
        cacheObjects();
        const interval = setInterval(cacheObjects, 1000 * 60 * 5);

        return () => clearInterval(interval);
    }, [data, cachedResourcesHook.isLoadingComplete]);

    if(data == undefined || !cachedResourcesHook.isLoadingComplete){
        return null;
    }

    return (
        <SessionContext.Provider value={session}>
            {props.children}
        </SessionContext.Provider>
    );
}
