import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Api from '../api';
import React from 'react';
import loadResources from '../hooks/useResources';
import * as SplashScreen from 'expo-splash-screen';

class Session{
    private data?: {[key: string]: any};
    public loaded = false;
    public isLoggedIn?: boolean;

    public loginNeeded?: boolean; // TODO document this

    public load(){
        const [ loaded, setLoaded ] = React.useState(false);

        if(loaded)
            return true;
        
        (async () => {
            const keys = await AsyncStorage.getAllKeys();

            const loadedData: {[key: string]: any} = {};

            await Promise.allSettled(keys.map(async (key) => {
                const value = await AsyncStorage.getItem(key);
                let data;
                try{
                    data = JSON.parse(value!);
                }catch(e){
                    data = value;
                } 
                loadedData[key] = data;
            }));

            this.data = loadedData;

            this.loaded = true;

            setLoaded(true);
        })();

        return false;
    }

    public set(key: string, value: any){
        if(this.data === undefined)
            throw new Error("Session data not loaded yet");

        this.data[key] = value;

        AsyncStorage.setItem(key, typeof value == "string" ? value : JSON.stringify(value))
            .catch((e) => console.error("Error writing to async storage:", e));
    }
    
    public setAll(data: {[key: string]: any}) {
        if(this.data === undefined)
            throw new Error("Session data not loaded yet");

        Object.assign(this.data, data);

        AsyncStorage.multiSet(Object.entries(data)
            .map(([key, value]) => [key, typeof value == "string" ? value : JSON.stringify(value)]))
            .catch((e) => console.error("Error writing to async storage:", e));
    }

    public get<T>(key: string): T{
        if(this.data === undefined)
            throw new Error("Session data not loaded yet");
        
        return this.data[key];
    }


    _update(data: {
        loginNeeded?: boolean,
    }){
        Object.assign(this, data);
        return this;
    }
}

export const SessionInstance = new Session();
export const SessionContext = React.createContext<Session>(SessionInstance);

export function SessionProvider(props: { children: any }) {
    const cachedResourcesHook = loadResources();
    const dataLoaded = SessionInstance.load();

    // Only cache certain objects for now
    const CACHED_HANDLERS = [
        Api.TagDataHandler,
        Api.UserDataHandler,
        Api.OrganizationDataHandler,
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
                        objData[key] =  {
                            _requestorType: obj.type,
                            id: obj.id,
                        }
                    }else{
                        objData[key] = obj[key];
                    }
                }
                return objData;
            });
            console.log("Serialized Objects", handler.type, objects);
            SessionInstance.set(handler.type + "_cachekey", objects);
        }
    }

    React.useEffect(() => {
        SplashScreen.preventAutoHideAsync();
    }, []);
    
    React.useEffect(() => {
        if(!dataLoaded || !cachedResourcesHook.isLoadingComplete)
            return;

        SplashScreen.hideAsync();
        
        cacheObjects();

        const interval = setInterval(cacheObjects, 1000 * 60 * 5);

        return () => clearInterval(interval);
    }, [dataLoaded, cachedResourcesHook.isLoadingComplete]);

    console.log(cachedResourcesHook.isLoadingComplete, dataLoaded);

    if(!cachedResourcesHook.isLoadingComplete ||
        !dataLoaded)
        return null;
    
    console.log("not null");

    return (
        <SessionContext.Provider value={SessionInstance._update({
            loginNeeded: cachedResourcesHook.defaultLoggedIn,
        })}>
            {props.children}
        </SessionContext.Provider>
    );
}
