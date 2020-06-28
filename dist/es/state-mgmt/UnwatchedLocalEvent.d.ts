import { IFmLocalEvent } from "../@types/index";
import { Record } from "../core";
export declare function UnwatchedLocalEvent<T>(rec: Record<T>, event: IFmLocalEvent<T>): {
    dbPath: string;
    watcherSource: string;
    dynamicPathProperties: string[];
    compositeKey: import("../@types").ICompositeKey<T>;
    modelConstructor: new () => T;
    modelName: string;
    pluralName: string;
    localModelName: string;
    localPath: string;
    localPostfix: string;
    kind: "record";
    operation: import("../@types").IFmCrudOperations;
    value: T;
    changed?: (keyof T)[];
    added?: (keyof T)[];
    removed?: (keyof T)[];
    priorValue?: T;
    type: import("../@types").FmEvents;
    key: string;
    transactionId: string;
    eventType: "value" | "child_added" | "child_changed" | "child_moved" | "child_removed" | "local";
    paths?: import("../core").IMultiPathUpdates[];
    errorCode?: string | number;
    errorMessage?: string;
} | {
    dbPath: string;
    watcherSource: string;
    dynamicPathProperties: string[];
    compositeKey: import("../@types").ICompositeKey<T>;
    modelConstructor: new () => T;
    modelName: string;
    pluralName: string;
    localModelName: string;
    localPath: string;
    localPostfix: string;
    kind: "relationship";
    operation: import("../@types").IFmRelationshipOperation;
    property: keyof T & string;
    fks: string[];
    inverseProperty?: "id" | "lastUpdated" | "createdAt" | "META";
    from: string;
    to: string;
    fromLocal: string;
    toLocal: string;
    fromConstructor: new () => T;
    toConstructor: new () => import("../@types").IModel;
    value?: undefined;
    paths: import("../@types").IFmPathValuePair[];
    type: import("../@types").FmEvents;
    key: string;
    transactionId: string;
    eventType: "value" | "child_added" | "child_changed" | "child_moved" | "child_removed" | "local";
    errorCode?: string | number;
    errorMessage?: string;
};
