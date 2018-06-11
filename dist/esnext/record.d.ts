import { RealTimeDB } from "abstracted-firebase";
import { BaseSchema, ISchemaOptions } from "./index";
import { fk } from "common-types";
import { Model, ILogger } from "./model";
export interface IWriteOperation {
    id: string;
    type: "set" | "pushKey" | "update";
    /** The database path being written to */
    path: string;
    /** The new value being written to database */
    value: any;
    /** called on positive confirmation received from server */
    callback: (type: string, value: any) => void;
}
export interface IRecordOptions {
    db?: RealTimeDB;
    logging?: ILogger;
    id?: string;
}
export declare class Record<T extends BaseSchema> {
    private _model;
    /**
     * create
     *
     * creates a new -- and empty -- Record object; often used in
     * conjunction with the Record's initialize() method
     */
    static create<T extends BaseSchema>(schema: new () => T, options?: IRecordOptions): Record<T>;
    /**
     * add
     *
     * Adds a new record to the database
     *
     * @param schema the schema of the record
     * @param newRecord the data for the new record
     * @param options
     */
    static add<T extends BaseSchema>(schema: new () => T, newRecord: T, options?: IRecordOptions): Promise<Record<T>>;
    /**
     * load
     *
     * static method to create a Record when you want to load the
     * state of the record with something you already have.
     *
     * Intent should be that this record already exists in the
     * database. If you want to add to the database then use add()
     */
    static load<T extends BaseSchema>(schema: new () => T, record: T, options?: IRecordOptions): Record<T>;
    static get<T extends BaseSchema>(schema: new () => T, id: string, options?: IRecordOptions): Promise<Record<T>>;
    private _existsOnDB;
    private _writeOperations;
    private _data?;
    constructor(_model: Model<T>, options?: IRecordOptions);
    readonly data: Readonly<T>;
    readonly isDirty: boolean;
    readonly META: ISchemaOptions;
    protected readonly db: RealTimeDB;
    protected readonly pluralName: string;
    protected readonly pushKeys: string[];
    /**
     * returns the fully qualified name in the database to this record;
     * this of course includes the record id so if that's not set yet calling
     * this getter will result in an error
     */
    readonly dbPath: string;
    readonly modelName: string;
    /** The Record's primary key */
    id: string;
    /**
     * returns the record's database offset without including the ID of the record;
     * among other things this can be useful prior to establishing an ID for a record
     */
    readonly dbOffset: string;
    /**
     * returns the record's location in the frontend state management framework;
     * depends on appropriate configuration of model to be accurate.
     */
    readonly localPath: string;
    /**
     * Allows an empty Record to be initialized to a known state.
     * This is not intended to allow for mass property manipulation other
     * than at time of initialization
     *
     * @param data the initial state you want to start with
     */
    _initialize(data: T): void;
    readonly existsOnDB: boolean;
    update(hash: Partial<T>): Promise<any>;
    /**
     * Pushes new values onto properties on the record
     * which have been stated to be a "pushKey"
     */
    pushKey<K extends keyof T>(property: K, value: T[K][keyof T[K]]): Promise<string>;
    /**
     * Updates a set of properties on a given model atomically (aka, all at once); will automatically
     * include the "lastUpdated" property.
     *
     * @param props a hash of name value pairs which represent the props being updated and their new values
     */
    updateProps(props: Partial<T>): Promise<void>;
    /**
     * Adds another fk to a hasMany relationship
     *
     * @param property the property which is acting as a foreign key (array)
     * @param ref reference to ID of related entity
     * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead.
     */
    addHasMany(property: Extract<keyof T, string>, ref: Extract<fk, string>, optionalValue?: any): Promise<void>;
    /**
     * Changes the local state of a property on the record
     *
     * @param prop the property on the record to be changed
     * @param value the new value to set to
     */
    set<K extends keyof T>(prop: K, value: T[K]): Promise<void>;
    /**
     * get a property value from the record
     *
     * @param prop the property being retrieved
     */
    get<K extends keyof T>(prop: K): Readonly<T>[K];
    toString(): string;
    toJSON(): {
        dbPath: string;
        modelName: string;
        pluralName: string;
        key: string;
        localPath: string;
        data: string;
    };
    /**
     * Load data from a record in database
     */
    private _getFromDB;
    private _save;
}