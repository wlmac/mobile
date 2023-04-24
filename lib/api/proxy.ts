
// Types

import { AxiosResponse } from 'axios';
import { Base64String, DateTimeString, ID, Nullable, TermType, TimezoneString, URLString, axiosInstance} from '.';

// i know this looks like garbage but trust me it'll be a lot cleaner where it's actually used

export type ObjectType = "tag" | "organization" | "comment" | "banner" | "news" |
                  "announcement" | "blog-post" | "event" | "flatpage" | "user";

export type StringToType<T extends ObjectType> = (
    T extends "tag" ? TagData :
    T extends "organization" ? OrganizationData :
    T extends "announcement" ? AnnouncementData :
    T extends "blog-post" ? BlogPostData :
    T extends "comment" ? CommentData :
    T extends "event" ? EventData :
    T extends "flatpage" ? FlatpageData :
    T extends "user" ? UserData : never
);

// Handle special cases for data types that can't be listed
export type StringToListType<T extends ObjectType> = (
    T extends ("comment" | "flatpage") ? never :
    StringToType<T>
);


// https://www.django-rest-framework.org/api-guide/pagination/#limitoffsetpagination

// Types for different apis

const OBJ_NAMES_ARRAY: ObjectType[] = ["tag", "organization", "comment", "banner", "news",
                                       "announcement", "blog-post", "event", "flatpage", "user"]

type KeyMapToWrapper<T> = { [key in keyof T]: key extends ID<infer U> ? IDObjectWrapper<U> : never };
type KeyArray<T> = Exclude<keyof T, keyof KeyMapToWrapper<T>>[];

class IDObjectWrapper<T>{
    private readonly TYPE: ObjectType;

    private cache: Map<ID<T>, T> = new Map();
    
    private readonly props: KeyArray<T>;
    private readonly idProps: KeyMapToWrapper<T>;
    private readonly idArrayProps: KeyMapToWrapper<T>;

    constructor(type: ObjectType, props: KeyArray<T>, idProps: KeyMapToWrapper<T>, idArrayProps: KeyMapToWrapper<T>){
        this.TYPE = type;

        this.props = props;
        this.idProps = idProps;
        this.idArrayProps = idArrayProps;
    }

    async get(id: ID<T>): Promise<T>{
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
function convertIdArrayToProxyArray<T extends {[key: string]: any}>(array: ID<T>[], proxy: IDProxy<T>){
    return array.map((id) => proxy.create(id));
}

// Data types

interface _TagData{
    name: string,
    color: string
}
export type TagData = WrapType<_TagData>;
const TagProxy = new IDProxy<_TagData>("tag");

interface _NewsData{
    author: UserData,
    created_date: DateTimeString,
    last_modified_date: DateTimeString,
    title: string,
    body: string,
    tags: TagData[],
    likes: number,
    comments: CommentDescriptor[],
}
export type NewsData = WrapType<_NewsData>;
const NewsProxy = new IDProxy<_NewsData>("news", (data) => {
    data.author = UserProxy.create(data.author);
    data.tags = convertIdArrayToProxyArray(data.tags, TagProxy);
    return data;
});

interface _AnnouncementData{
    show_after: DateTimeString,
    is_public: boolean,
    status: "d" | "p" | "a" | "r",
    rejection_reason: string,
    organization: ID<OrganizationData>,
    supervisor: Nullable<ID<UserData>>,
}
export type AnnouncementData = WrapType<_AnnouncementData>;
const AnnouncementProxy = new IDProxy<_AnnouncementData>("announcement", (data) => {
    data.organization = OrganizationProxy.create(data.organization);
    if(data.supervisor !== null)
        data.supervisor = UserProxy.create(data.supervisor);
    return data;
});

interface _BlogPostData{
    slug: string,
    views: number,
    featured_image: URLString,
    featured_image_description: string,
    is_published: boolean,
}
export type BlogPostData = WrapType<_BlogPostData>
const BlogPostProxy = new IDProxy<_BlogPostData>("blog-post");

interface _EventData{
    name: string,
    description: string,
    term: TermType,
    organization: ID<OrganizationData>,
    time: {
        start: DateTimeString,
        end: DateTimeString,
    },
    scheduleFormat: number,
    instructional: number,
    is_public: boolean,
    tags: ID<TagData>[],
}
export type EventData = WrapType<_EventData>;
const EventProxy = new IDProxy<_EventData>("event", (data) => {
    data.organization = OrganizationProxy.create(data.organization);
    data.tags = convertIdArrayToProxyArray(data.tags, TagProxy);
    return data;
});

interface _UserData{
    username: string,
    first_name: string,
    last_name: string,
    graduating_year: number,
    email_hash: Base64String,
    gravatar_url: URLString,

    bio: string,
    timezone: TimezoneString,
    organizations: ID<OrganizationData>[],
    following: ID<UserData>[],
    saved_blogs: ID<BlogPostData>[],
    saved_announcements: ID<AnnouncementData>[],
}
export type UserData = WrapType<_UserData>;
const UserProxy = new IDProxy<_UserData>("user", (data) => {
    data.organizations = convertIdArrayToProxyArray(data.organizations, OrganizationProxy);
    data.following = convertIdArrayToProxyArray(data.following, UserProxy);
    data.saved_blogs = convertIdArrayToProxyArray(data.saved_blogs, BlogPostProxy);
    data.saved_announcements = convertIdArrayToProxyArray(data.saved_announcements, AnnouncementProxy);
    return data;
});

interface _OrganizationData{
    owner: ID<UserData>,
    supervisors: ID<UserData>[],
    execs: ID<UserData>[],
    members: ID<UserData>[],
    name: string,
    bio: string,
    extra_content: string,
    slug: string,
    registered_date: DateTimeString,
    show_members: boolean,
    is_active: boolean,
    is_open: boolean,
    applications_open: boolean,
    tags: ID<TagData>[],
    banner: string,
    icon: URLString,
    links: string[],
}
export type OrganizationData = WrapType<_OrganizationData>;
const OrganizationProxy = new IDProxy<_OrganizationData>("organization", (data) => {
    data.owner = UserProxy.create(data.owner);
    data.supervisors = convertIdArrayToProxyArray(data.supervisors, UserProxy);
    data.execs = convertIdArrayToProxyArray(data.execs, UserProxy);
    data.members = convertIdArrayToProxyArray(data.members, UserProxy);
    data.tags = convertIdArrayToProxyArray(data.tags, TagProxy);
    return data;
});

interface _CommentData{
    author: Nullable<ID<UserData>>,
    body: Nullable<string>,
    created_at: Nullable<DateTimeString>,
    likes: number,
    edited: boolean,
    children: CommentDescriptor[],
}
export type CommentData = WrapType<_CommentData>;
const CommentProxy = new IDProxy<_CommentData>("comment", (data) => {
    if(data.author !== null)
        data.author = UserProxy.create(data.author);
    return data;
});

// Unused for now

interface CommentDescriptor{
    id: CommentData,
    has_children: boolean,
    body: Nullable<string>,
    author: ID<UserData>,
    likes: number,
}

interface BannerData{
    current: { content: string }[],
    upcoming: { content: string }[],
}


interface FlatpageData{
    slug: string,
    content: string,
}



