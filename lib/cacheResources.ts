import AsyncStorage from '@react-native-async-storage/async-storage';
import apiRequest from '../lib/apiRequest';

export default async function cacheResources(): Promise<void> {
    return new Promise((resolve, reject) => {
        storeAnnouncements().then(() => {
            resolve();
        })
    });
}

export async function storeAnnouncements(): Promise<void> {
    console.log('Being called');

    var announcements: Object[] = [];
    var myAnnouncements: Object[] = [];
    var orgName: { [id: number]: string } = {};
    var orgIcon: { [id: number]: string } = {};
    var myOrgs: Object[] = [];


    // organizations
    await apiRequest('/api/organizations?format=json', '', 'GET').then((res) => {
        if (res.success) {
            JSON.parse(res.response).forEach((org: any) => {
                orgName[org.id] = org.name;
                orgIcon[org.id] = org.icon;
            });
            AsyncStorage.setItem("@orgName", JSON.stringify(orgName));
            AsyncStorage.setItem("@orgIcon", JSON.stringify(orgIcon));
            //console.log('organization cache done');
        } else {
            //console.log("organization cache failed");
        }
    });

    // my organizations
    await apiRequest('/api/me?format=json', '', 'GET').then((res) => {
        if (res.success) {
            AsyncStorage.setItem("@myOrgs", JSON.stringify(res.response));
            myOrgs = JSON.parse(res.response).organizations;
            //console.log("my orgs cache done");
        } else {
            //console.log("my orgs cache failed");
        }
    });

    // announcements
    await apiRequest('/api/announcements?format=json', '', 'GET').then((res) => {
        if (res.success) {
            announcements = JSON.parse(res.response);
            //console.log('announcement cache done');
        } else {
            //console.log("announcement cache failed");
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
