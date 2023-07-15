import { AxiosRequestConfig } from 'axios';
import { Base64String, DateTimeString, ID, LimitOffsetPagination, Nullable, TermType, TimezoneString, URLString, anyObject } from './misc';
import { Handler, IDDescriptor, IDObject, Requestor } from './obj';
import { apiRequest } from './core';
import { Session } from '../util/session';

export class TagDescriptor extends IDDescriptor<TagDescriptor, TagData>{
    name!: string;
    color!: string;
}
export class TagData extends IDObject<TagData>{
    name!: string;
    color!: string;
    organization!: Requestor<Nullable<OrganizationData>>;

    protected preprocess(data: anyObject): anyObject {
        const { organization, ...rest } = super.preprocess(data);

        this.organization = this.createNullableIDRequestor<OrganizationData>(organization, OrganizationDataHandler);

        return rest;
    }

    public static getHandler(): Handler<TagData>{
        return TagDataHandler;
    }
}
export const TagDataHandler = new Handler<TagData, TagDescriptor>("tag", TagData, TagDescriptor);

export class NewsData extends IDObject<NewsData>{
    author!: Requestor<UserData>;
    created_date!: string;
    last_modified_date!: string;
    title!: string;
    body!: string;
    tags!: Requestor<TagData>[];
    likes!: number;

    protected preprocess(data: anyObject): anyObject {
        const { author, tags, ...rest } = super.preprocess(data);

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
    created_date!: Date;
    last_modified_date!: Date;
    show_after!: Date;
    title!: string;
    body!: string;
    is_public!: boolean;
    status!: string;
    rejection_reason!: string;
    author!: UserDescriptor;
    organization!: OrganizationDescriptor;
    supervisor!: Requestor<Nullable<UserData>>;
    tags!: TagDescriptor[];
    comments!: CommentDescriptor[];

    protected preprocess(data: anyObject): anyObject {
        const { author, organization, supervisor, comments, tags, ...rest } = super.preprocess(data);
        
        this.author = this.createDescriptor<UserDescriptor>(author, UserDataHandler);
        this.organization = this.createDescriptor<OrganizationDescriptor>(organization, OrganizationDataHandler);
        this.supervisor = this.createNullableIDRequestor<UserData>(supervisor, UserDataHandler);
        this.comments = this.createDescriptorArray<CommentDescriptor>(comments, CommentDataHandler);
        this.tags = this.createDescriptorArray<TagDescriptor>(tags, TagDataHandler);

        return rest;
    }

    public static getHandler(): Handler<AnnouncementData>{
        return AnnouncementDataHandler;
    }
}
export const AnnouncementDataHandler = new Handler<AnnouncementData>("announcement", AnnouncementData);

export class BlogPostData extends IDObject<BlogPostData>{
    slug!: string;
    title!: string;
    body!: string;
    author!: UserDescriptor;
    views!: number;
    created_date!: Date;
    last_modified_date!: Date;
    featured_image!: URLString;
    featured_image_description!: string;
    is_published!: boolean;
    tags!: TagDescriptor[];
    likes!: number;
    comments!: CommentDescriptor[];

    protected preprocess(data: anyObject): anyObject {
        const { author, comments, tags, ...rest } = super.preprocess(data);

        this.author = this.createDescriptor<UserDescriptor>(author, UserDataHandler);
        this.comments = this.createDescriptorArray<CommentDescriptor>(comments, CommentDataHandler);
        this.tags = this.createDescriptorArray<TagDescriptor>(tags, TagDataHandler);

        return rest;
    }

    public static getHandler(): Handler<BlogPostData>{
        return BlogPostDataHandler;
    }
}
export const BlogPostDataHandler = new Handler<BlogPostData>("blog-post", BlogPostData);

export class EventData extends IDObject<EventData>{
    tags!: TagDescriptor[];
    organization!: OrganizationDescriptor
    name!: string;
    description!: string;
    start_date!: Date;
    end_date!: Date;
    should_announce!: boolean;
    
    schedule_format?: string; // TODO: enum
    is_instructional?: number;
    is_public?: boolean;
    term?: TermType;

    protected preprocess(data: anyObject): anyObject {
        const { tags, organization, ...rest } = super.preprocess(data);

        this.tags = this.createDescriptorArray<TagDescriptor>(tags, TagDataHandler);
        this.organization = this.createDescriptor<OrganizationDescriptor>(organization, OrganizationDataHandler);

        return rest;
    }

    public static getHandler(): Handler<EventData>{
        return EventDataHandler;
    }
}
class EventDataHandlerImpl extends Handler<EventData> {
    // workaround because the backend does not support filtering by start/end date
    async *list(session: Session, limit=50, offset=0, options?: AxiosRequestConfig<LimitOffsetPagination<EventData>>): AsyncIterableIterator<EventData> {
        if(!options){
            for await(const data of super.list(session, limit, offset, options)){
                yield data;
            }
            return;
        }

        const request = await apiRequest<any[]>(`v3/events?limit=${limit}&offset=${offset}`, undefined, "GET", session, true, options as any);
        if(typeof request == "string")
            throw new Error(request);
        
        for(const data of request){
            yield this.fromRawData(data);
        }
    }
}
export const EventDataHandler = new EventDataHandlerImpl("event", EventData);

export class UserDescriptor extends IDDescriptor<UserDescriptor, UserData>{
    username!: string;
    first_name!: string;
    last_name!: string;
    gravatar_url!: URLString;
}
export class UserData extends IDObject<UserData>{
    username!: string;
    first_name!: string;
    last_name!: string;
    graduating_year!: number; // TODO: is this not nullable?
    email_hash!: Base64String; // ^^^
    gravatar_url!: URLString;
    bio!: string;
    timezone!: TimezoneString;
    organizations!: Requestor<OrganizationData>[];
    tags_following!: Requestor<UserData>[];
    saved_blogs!: Requestor<BlogPostData>[];
    saved_announcements!: Requestor<AnnouncementData>[];

    protected preprocess(data: anyObject): anyObject {
        const { organizations, following, saved_blogs, saved_announcements, ...rest } = super.preprocess(data);;

        this.organizations = this.createIDRequestorArray(organizations, OrganizationDataHandler);
        this.tags_following = this.createIDRequestorArray(following, UserDataHandler);
        this.saved_blogs = this.createIDRequestorArray(saved_blogs, BlogPostDataHandler);
        this.saved_announcements = this.createIDRequestorArray(saved_announcements, AnnouncementDataHandler);

        return rest;
    }

    public static getHandler(): Handler<UserData, UserDescriptor>{
        return UserDataHandler;
    }
}
export const UserDataHandler = new Handler<UserData, UserDescriptor>("user", UserData, UserDescriptor);

export class OrganizationDescriptor extends IDDescriptor<OrganizationDescriptor, OrganizationData>{
    name!: string;
    slug!: string;
    icon!: URLString;
}
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
        const { owner, supervisors, execs, members, tags, registered_date, ...rest } = super.preprocess(data);;

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
export const OrganizationDataHandler = new Handler<OrganizationData>("organization", OrganizationData, OrganizationDescriptor);

export class CommentDescriptor extends IDDescriptor<CommentDescriptor, CommentData>{
    has_children!: boolean;
    body!: Nullable<string>;
    author!: Requestor<UserData>;
    likes!: number;
}
export class CommentData extends IDObject<CommentData>{
    author!: Requestor<Nullable<UserData>>;
    body!: Nullable<string>;
    created_at!: Nullable<Date>;
    likes!: number;
    edited!: boolean;
    children!: CommentDescriptor[];

    protected preprocess(data: anyObject): anyObject {
        const { author, created_at, ...rest } = super.preprocess(data);;
        
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