
import { EventDataHandler, OrganizationDataHandler, TagDataHandler, UserDataHandler } from '../api';
import { Handler, IDObject } from '../api/obj';

export default async function cacheResources() {
    async function cacheObjects<T extends IDObject<T>>(handler: Handler<T>, options: { [key: string]: any } = {}){
        try{
            for await(const data of handler.list(5000, 0, options)){}
            console.log(handler.type + ":");
            console.table(handler._cache);
        }catch(e){
            console.error(e);
        }
    }

    await Promise.all([
        cacheObjects(OrganizationDataHandler),
        cacheObjects(TagDataHandler),
        cacheObjects(UserDataHandler),
        cacheObjects(EventDataHandler, { params: { start: '2021-09-20' } })
    ]);
}
