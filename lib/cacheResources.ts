import AsyncStorage from '@react-native-async-storage/async-storage';
import apiRequest from '../lib/apiRequest';

export default async function cacheResources(): Promise<void> {
    await storeApiCalls();
}

export async function storeApiCalls(): Promise<void> {
    var orgs: Object[] = new Array(10000);
    var tags: Object[] = new Array(10000);
    var users: Object[] = new Array(10000);
    // organizations

    await Promise.all([
        apiRequest('/api/organizations?format=json', '', 'GET', true).then((res) => {
            if (res.success) {
                let jsonres = JSON.parse(res.response);
                if(jsonres && Array.isArray(jsonres)) {
                    for(let org of jsonres){
                        orgs[org.id] = {name: org.name, icon: org.icon};
                    }
                }
            } else {
                console.error("API request error: " + res.response);
            }
            AsyncStorage.setItem("@orgs", JSON.stringify(orgs));
        }),
        apiRequest('/api/v3/obj/tag?limit=5000', '', 'GET', true).then((res) => {
            if (res.success) {
                let jsonres = JSON.parse(res.response);
                if(jsonres && Array.isArray(jsonres.results)) {
                    for(let tag of jsonres.results){
                        tags[tag.id] = {name: tag.name, color: tag.color};
                    }
                }
            } else {
                console.error("API request error: " + res.response);
            }
            AsyncStorage.setItem("@tags", JSON.stringify(tags));
        }),
        apiRequest('/api/v3/obj/user?limit=5000', '', 'GET', true).then((res) => {
            if (res.success) {
                let jsonres = JSON.parse(res.response);
                if(jsonres && Array.isArray(jsonres.results)) {
                    for(let user of jsonres.results){
                        let { username, first_name, last_name, graduating_year } = user;
                        users[user.id] = { username, first_name, last_name, graduating_year };
                    }
                }
            } else {
                console.error("API request error: " + res.response);
            }
            AsyncStorage.setItem("@users", JSON.stringify(users));
        }),
        apiRequest(`/api/events?start=2021-09-20`, '', 'GET', true).then((res) => {
            if (res.success) {
                AsyncStorage.setItem("@events", res.response);
            } else {
                console.error("API request error: " + res.response);
            }
        })
    ]);
}
