import apiRequest from '../lib/apiRequest';
import { Identifiable, LimitOffsetPagination, OrganizationData, TagData } from './ApiTypes';
import Storage from './Storage';

async function cacheResources() {
    await storeApiCalls();
}

async function storeApiCalls() {

    async function fetchListAndSet<T extends Identifiable>(endpoint: string, key: string){
        let ans = new Map<number, T>();
        let res = await apiRequest<LimitOffsetPagination<T>>(endpoint, '', 'GET', true);
        if(res.success){
            let jsonres = res.data as LimitOffsetPagination<T>;
            for(let item of jsonres.results){
                ans.set(item.id, item);
            }
        }else{
            console.error("API request error: " + res.error);
        }
        console.log(key + ":");
        console.table(ans.entries());
        Storage.set(key, ans);
    }

    await Promise.all([
        fetchListAndSet('/api/v3/obj/organization', 'orgs'),
        fetchListAndSet('/api/v3/obj/tag?limit=5000&offset=0', 'tags'),
        fetchListAndSet('/api/v3/obj/user?limit=5000&offset=0', 'users'),
        fetchListAndSet('/api/v3/obj/events?start=2021-09-20', 'events'),
    ]);
}
