import { AxiosRequestConfig } from 'axios';
import { Base64String, DateTimeString, ID, LimitOffsetPagination, Nullable, TermType, TimezoneString, URLString, anyObject } from './misc';
import { Handler, IDObject, Requestor } from './obj';
import { apiRequest } from './core';

export class TagData extends IDObject<TagData>{
    name!: string;
    color!: string;

    public static getHandler(): Handler<TagData>{
        return TagDataHandler;
    }
}
export const TagDataHandler = new Handler<TagData>("tag", TagData);

export class NewsData extends IDObject<NewsData>{
    author!: Requestor<UserData>;
    created_date!: string;
    last_modified_date!: string;
    title!: string;
    body!: string;
    tags!: Requestor<TagData>[];
    likes!: number;

    protected preprocess(data: anyObject): anyObject {
        const { author, tags, ...rest } = data;

        this.author = this.createIDRequestor<UserData>(author, UserDataHandler);
        this.tags = this.createIDRequestorArray<TagData>(tags, TagDataHandler);

        return rest;
    }

    public static getHandler(): Handler<NewsData>{
        return NewsDataHandler;
    }
}
export const NewsDataHandler = new Handler<NewsData>("news", NewsData);

export class AnnouncementData extends IDObject<AnnouncementData>{
    show_after!: DateTimeString;
    is_public!: boolean;
    status!: "d" | "p" | "a" | "r";
    rejection_reason!: string;
    organization!: Requestor<OrganizationData>;
    supervisor!: Requestor<Nullable<UserData>>;

    protected preprocess(data: anyObject): anyObject {
        const { organization, supervisor, ...rest } = data;

        this.organization = this.createIDRequestor<OrganizationData>(organization, OrganizationDataHandler);
        this.supervisor = this.createNullableIDRequestor<UserData>(supervisor, UserDataHandler);

        return rest;
    }

    public static getHandler(): Handler<AnnouncementData>{
        return AnnouncementDataHandler;
    }
}
export const AnnouncementDataHandler = new Handler<AnnouncementData>("announcement", AnnouncementData);

export class BlogPostData extends IDObject<BlogPostData>{
    slug!: string;
    views!: number;
    featured_image!: URLString;
    featured_image_description!: string;
    is_published!: boolean;

    public static getHandler(): Handler<BlogPostData>{
        return BlogPostDataHandler;
    }
}
export const BlogPostDataHandler = new Handler<BlogPostData>("blog-post", BlogPostData);

export class EventData extends IDObject<EventData>{
    name!: string;
    description!: string;
    term!: TermType;
    organization!: Requestor<OrganizationData>;
    start_date!: Date;
    end_date!: Date;
    is_public!: boolean;
    tags!: Requestor<TagData>[];
    
    schedule_format?: number;
    is_instructional?: number;

    protected preprocess(data: anyObject): anyObject {
        const { organization, tags, start_date, end_date, ...rest } = data;

        this.organization = this.createIDRequestor<OrganizationData>(organization, OrganizationDataHandler);
        this.tags = this.createIDRequestorArray<TagData>(tags, TagDataHandler);
        this.start_date = new Date(start_date);
        this.end_date = new Date(end_date);

        return rest;
    }

    public static getHandler(): Handler<EventData>{
        return EventDataHandler;
    }
}
class EventDataHandlerImpl extends Handler<EventData> {
    // workaround because the backend does not support filtering by start/end date
    async *list(limit=50, offset=0, options?: AxiosRequestConfig<LimitOffsetPagination<EventData>>): AsyncIterableIterator<EventData> {
        if(!options){
            for await(const data of super.list(limit, offset)){
                yield data;
            }
            return;
        }

        const request = await apiRequest<any[]>(`v3/events?limit=${limit}&offset=${offset}`, undefined, "GET", true, options as any);
        if(typeof request == "string")
            throw new Error(request);
        
        for(const data of request){
            yield this.create(data);
        }
    }
}
export const EventDataHandler = new EventDataHandlerImpl("event", EventData);

export class UserData extends IDObject<UserData>{
    username!: string;
    first_name!: string;
    last_name!: string;
    graduating_year!: number;
    email_hash!: Base64String;
    gravatar_url!: URLString;

    bio?: string;
    timezone?: TimezoneString;
    organizations?: Requestor<OrganizationData>[];
    tags_following?: Requestor<UserData>[];
    saved_blogs?: Requestor<BlogPostData>[];
    saved_announcements?: Requestor<AnnouncementData>[];

    protected preprocess(data: anyObject): anyObject {
        const { organizations, following, saved_blogs, saved_announcements, ...rest } = data;

        this.organizations = this.createIDRequestorArray(organizations, OrganizationDataHandler);
        this.tags_following = this.createIDRequestorArray(following, UserDataHandler);
        this.saved_blogs = this.createIDRequestorArray(saved_blogs, BlogPostDataHandler);
        this.saved_announcements = this.createIDRequestorArray(saved_announcements, AnnouncementDataHandler);

        return rest;
    }

    public static getHandler(): Handler<UserData>{
        return UserDataHandler;
    }
}
export const UserDataHandler = new Handler<UserData>("user", UserData);

export class OrganizationData extends IDObject<OrganizationData>{
    owner!: Requestor<UserData>;
    supervisors!: Requestor<UserData>[];
    execs!: Requestor<UserData>[];
    members!: Requestor<UserData>[];
    name!: string;
    bio!: string;
    extra_content!: string;
    slug!: string;
    registered_date!: Date;
    show_members!: boolean;
    is_active!: boolean;
    is_open!: boolean;
    applications_open!: boolean;
    tags!: Requestor<TagData>[];
    banner!: string;
    icon!: URLString;
    links!: string[];

    protected preprocess(data: anyObject): anyObject {
        const { owner, supervisors, execs, members, tags, registered_date, ...rest } = data;

        this.owner = this.createIDRequestor<UserData>(owner, UserDataHandler);
        this.supervisors = this.createIDRequestorArray<UserData>(supervisors, UserDataHandler);
        this.execs = this.createIDRequestorArray<UserData>(execs, UserDataHandler);
        this.members = this.createIDRequestorArray<UserData>(members, UserDataHandler);
        this.tags = this.createIDRequestorArray<TagData>(tags, TagDataHandler);
        this.registered_date = new Date(registered_date);

        return rest;
    }

    public static getHandler(): Handler<OrganizationData>{
        return OrganizationDataHandler;
    }
}
export const OrganizationDataHandler = new Handler<OrganizationData>("organization", OrganizationData);

interface CommentDescriptor{
    id: ID<CommentData>;
    has_children: boolean;
    body: Nullable<string>;
    author: Requestor<UserData>;
    likes: number;
}
export class CommentData extends IDObject<CommentData>{
    author!: Requestor<Nullable<UserData>>;
    body!: Nullable<string>;
    created_at!: Nullable<Date>;
    likes!: number;
    edited!: boolean;
    children!: CommentDescriptor[];

    protected preprocess(data: anyObject): anyObject {
        const { author, created_at, ...rest } = data;
        
        this.author = this.createNullableIDRequestor<UserData>(author, UserDataHandler);
        this.created_at = created_at ? new Date(created_at) : null;

        return rest;
    }

    public static getHandler(): Handler<CommentData>{
        return CommentDataHandler;
    }
}
export const CommentDataHandler = new Handler<CommentData>("comment", CommentData); 

// Unused for now

interface BannerData{
    current: { content: string }[];
    upcoming: { content: string }[];
}

interface FlatpageData{
    slug: string;
    content: string;
}