import { IDictionary, fk } from "common-types";
export declare type IIdWithDynamicPrefix = IDictionary<number | string> & {
    id: string;
};
export declare type ICompositeKey = IDictionary<string | number> & {
    id: string;
};
export declare type IFkReference = fk | ICompositeKey;
