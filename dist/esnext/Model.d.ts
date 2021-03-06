export declare type NonProperties<T> = {
    [P in keyof T]: T[P] extends () => any ? never : P;
}[keyof T];
export declare type Properties<T> = Pick<T, NonProperties<T>>;
import { epochWithMilliseconds } from "common-types";
import { IFmModelMeta } from "./decorators/types";
export declare class Model {
    /** The primary-key for the record */
    id?: string;
    /** The last time that a given record was updated */
    lastUpdated?: epochWithMilliseconds;
    /** The datetime at which this record was first created */
    createdAt?: epochWithMilliseconds;
    /** Metadata properties of the given schema */
    META?: IFmModelMeta;
}
