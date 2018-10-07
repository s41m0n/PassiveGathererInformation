export declare class Shared {
    static Mine: string;
    static Shared: string;
    static Public: string;
}
export declare class ShareLevel {
    static Read: string;
    static Contribute: string;
}
export interface ICollection {
    created?: Date;
    owner?: {
        name: string;
    };
    title?: string;
    contents?: {
        wiki: string;
        reports: Array<any>;
    };
    collectionID: string;
    writeable?: boolean;
    deletable?: boolean;
    nPeople?: number;
    shared?: Shared;
    mine?: boolean;
    link: string;
    acl?: any;
}
export interface CollectionRetreival {
    collectionID?: string;
    type?: Shared;
}
export interface CollectionShare {
    email?: string;
    level?: ShareLevel;
}
