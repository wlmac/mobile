import AsyncStorage from '@react-native-async-storage/async-storage';
import apiRequest from '../lib/apiRequest';

export default async function cacheResources(): Promise<void> {
    return new Promise((resolve, reject) => {
        storeApiCalls().then(() => {
            resolve();
        })
    });
}

export async function storeApiCalls(): Promise<void> {
    var orgs: Object[] = new Array(1000);
    var tags: Object[] = new Array(1000);
    var users = new Array(1000);
    // organizations
    await apiRequest('/api/organizations?format=json', '', 'GET', true).then((res) => {
        if (res.success) {
            let jsonres = JSON.parse(res.response);
            if(jsonres && Array.isArray(jsonres)) {
                jsonres.forEach((org: any) => {
                    orgs[org.id] = {name: org.name, icon: org.icon};
                });
            }
        } else {
            console.log("API request error: " + res.response);
        }
    });
    AsyncStorage.setItem("@orgs", JSON.stringify(orgs));
    await apiRequest('/api/v3/obj/tag?format=json&limit=5000', '', 'GET', true).then((res) => {
        if (res.success) {
            let jsonres = JSON.parse(res.response);
            if(jsonres && Array.isArray(jsonres.results)) {
                jsonres.results.forEach((tag: any) => {
                    tags[tag.id] = {name: tag.name, color: tag.color};
                });
            }
        } else {
            console.log("API request error: " + res.response);
        }
    });
    AsyncStorage.setItem("@tags", JSON.stringify(tags));
    await apiRequest('/api/v3/obj/user?format=json&limit=5000', '', 'GET', true).then((res) => {
        if (res.success) {
            let jsonres = JSON.parse(res.response);
            if(jsonres && Array.isArray(jsonres.results)) {
                jsonres.results.forEach((user: any) => {
                    users[user.id] = {username: user.username, first_name: user.first_name, last_name: user.last_name, graduating_year: user.graduating_year};
                });
            }
        } else {
            console.log("API request error: " + res.response);
        }
    });
    AsyncStorage.setItem("@users", JSON.stringify(users));
    await apiRequest(`/api/events?start=2021-09-20`, '', 'GET', true).then(res => {
        if (res.success) {
            AsyncStorage.setItem("@events", res.response);
        } else {
            console.log("API request error: " + res.response);
        }
    });
}
