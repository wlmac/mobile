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

    await apiRequest(`/api/events?start=2021-09-20`, '', 'GET', true).then(res => {
        if (res.success) {
            AsyncStorage.setItem("@events", res.response);
        } else {
            console.log("API request error: " + res.response);
        }
    });
}
