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
    var announcements: Object[] = [];
    var myAnnouncements: Object[] = [];
    var orgName: { [id: number]: string } = {};
    var orgIcon: { [id: number]: string } = {};
    var myOrgs: Object[] = [];


    // organizations
    await apiRequest('/api/organizations?format=json', '', 'GET').then((res) => {
        if (res.success) {
            let jsonres = JSON.parse(res.response);
            if(jsonres.results) {
                jsonres.results.forEach((org: any) => {
                    orgName[org.id] = org.name;
                    orgIcon[org.id] = org.icon;
                });
            }
            //console.log('organization cache done');
        } else {
            //console.log("organization cache failed");
        }
    });

    // my organizations
    await apiRequest('/api/me?format=json', '', 'GET').then((res) => {
        if (res.success) {
            myOrgs = JSON.parse(res.response).organizations;
            //console.log("my orgs cache done");
        } else {
            //console.log("my orgs cache failed");
        }
    });

    // announcements
    await apiRequest('/api/announcements?format=json', '', 'GET').then((res) => {
        if (res.success) {
            let jsonres = JSON.parse(res.response);
            if(jsonres.results) {
                announcements = jsonres.results;
            }
            //console.log('announcement cache done');
        } else {
            //console.log("announcement cache failed");
        }
    });

    await apiRequest(`/api/events?start=2021-09-20`, '', 'GET').then(res => {
        if (res.success) {
            AsyncStorage.setItem("@events", res.response);
        } else {
            console.log("API request error: " + res.response);
        }
    });

    // my announcements
    announcements.forEach((item: any) => {
        let orgId = item.organization.id; // gets the organization id
        item.icon = orgIcon[orgId];
        item.name = orgName[orgId];
        if (myOrgs.includes(orgName[orgId])) { // checks against the user's organization list
            myAnnouncements.push(item);
        }
    });

    AsyncStorage.setItem("@announcements", JSON.stringify(announcements));
    AsyncStorage.setItem("@myann", JSON.stringify(myAnnouncements));
}
