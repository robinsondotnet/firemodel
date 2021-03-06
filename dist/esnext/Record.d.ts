import { RealTimeDB } from "abstracted-firebase";
import { Model } from "./Model";
import { IDictionary, Omit, Nullable, fk, pk } from "common-types";
import { FireModel } from "./FireModel";
import { IReduxDispatch } from "./state-mgmt";
import { IFMEventName, IFmCrudOperations, IFmDispatchOptions } from "./state-mgmt/index";
import { IFkReference, ICompositeKey, IRecordOptions } from "./@types/record-types";
import { IFmRelationshipOptionsForHasMany } from ".";
import { IFmRelationshipOptions } from "./@types";
import { IFmModelMeta } from "./decorators";
/**
 * a Model that doesn't require the ID tag (or the META tag which not a true
 * property of the model)
 * */
export declare type ModelOptionalId<T extends Model> = Omit<T, "id" | "META"> & {
    id?: string;
    META?: IFmModelMeta;
};
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
export declare class Record<T extends Model> extends FireModel<T> {
    protected options: IRecordOptions;
    static set defaultDb(db: RealTimeDB);
    static get defaultDb(): RealTimeDB;
    static set dispatch(fn: IReduxDispatch);
    /**
     * **dynamicPathProperties**
     *
     * An array of "dynamic properties" that are derived fom the "dbOffset" to
     * produce the "dbPath". Note: this does NOT include the `id` property.
     */
    static dynamicPathProperties<T extends Model = Model>(
    /**
     * the **Model** who's properties are being interogated
     */
    model: new () => T): (keyof T & string)[];
    /**
     * create
     *
     * creates a new -- and empty -- Record object; often used in
     * conjunction with the Record's initialize() method
     */
    static create<T extends Model>(model: new () => T, options?: IRecordOptions): Record<T>;
    /**
     * Creates an empty record and then inserts all values
     * provided along with default values provided in META.
     */
    static local<T extends Model>(model: new () => T, values: Partial<T>, options?: IRecordOptions & {
        ignoreEmptyValues?: boolean;
    }): Record<T>;
    /**
     * add
     *
     * Adds a new record to the database
     *
     * @param schema the schema of the record
     * @param payload the data for the new record; this optionally can include the "id" but if left off the new record will use a firebase pushkey
     * @param options
     */
    static add<T extends Model>(model: (new () => T) | string, payload: ModelOptionalId<T>, options?: IRecordOptions): Promise<Record<T>>;
    /**
     * **update**
     *
     * update an existing record in the database with a dictionary of prop/value pairs
     *
     * @param model the _model_ type being updated
     * @param id the `id` for the model being updated
     * @param updates properties to update; this is a non-destructive operation so properties not expressed will remain unchanged. Also, because values are _nullable_ you can set a property to `null` to REMOVE it from the database.
     * @param options
     */
    static update<T extends Model>(model: new () => T, id: string | ICompositeKey<T>, updates: Nullable<Partial<T>>, options?: IRecordOptions): Promise<Record<T>>;
    /**
     * Pushes a new item into a property that is setup as a "pushKey"
     *
     * @param model the model being operated on
     * @param id  `id` or `composite-key` that uniquely identifies a record
     * @param property the property on the record
     * @param payload the new payload you want to push into the array
     */
    static pushKey<T extends Model>(model: new () => T, id: string | ICompositeKey<T>, property: keyof T & string, payload: any, options?: IRecordOptions): Promise<string>;
    /**
     * **createWith**
     *
     * A static initializer that creates a Record of a given class
     * and then initializes the state with either a Model payload
     * or a CompositeKeyString (aka, '[id]::[prop]:[value]').
     *
     * You should be careful in using this initializer; the expected
     * _intents_ include:
     *
     * 1. to initialize an in-memory record of something which is already
     * in the DB
     * 2. to get all the "composite key" attributes into the record so
     * all META queries are possible
     *
     * If you want to add this record to the database then use `add()`
     * initializer instead.
     *
     * @prop model a constructor for the underlying model
     * @payload either a string representing an `id` or Composite Key or alternatively
     * a hash/dictionary of attributes that are to be set as a starting point
     */
    static createWith<T extends Model>(model: new () => T, payload: Partial<T> | string, options?: IRecordOptions): Record<T>;
    /**
     * get (static initializer)
     *
     * Allows the retrieval of records based on the record's id (and dynamic path prefixes
     * in cases where that applies)
     *
     * @param model the model definition you are retrieving
     * @param id either just an "id" string or in the case of models with dynamic path prefixes you can pass in an object with the id and all dynamic prefixes
     * @param options
     */
    static get<T extends Model>(model: new () => T, id: string | ICompositeKey<T>, options?: IRecordOptions): Promise<Record<T>>;
    static remove<T extends Model>(model: new () => T, id: IFkReference<T>, 
    /** if there is a known current state of this model you can avoid a DB call to get it */
    currentState?: Record<T>): Promise<Record<T>>;
    /**
     * Associates a new FK to a relationship on the given `Model`; returning
     * the primary model as a return value
     */
    static associate<T extends Model>(model: new () => T, id: pk, property: keyof T & string, refs: IFkReference<any> | Array<IFkReference<any>>): Promise<Record<T>>;
    /**
     * Given a database _path_ and a `Model`, pull out the composite key from
     * the path. This works for Models that do and _do not_ have dynamic segments
     * and in both cases the `id` property will be returned as part of the composite
     * so long as the path does indeed have the `id` at the end of the path.
     */
    static getCompositeKeyFromPath<T extends Model>(model: new () => T, path: string): IDictionary<any>;
    /**
     * Given a Model and a partial representation of that model, this will generate
     * a composite key (in _object_ form) that conforms to the `ICompositeKey` interface
     * and uniquely identifies the given record.
     *
     * @param model the class definition of the model you want the CompositeKey for
     * @param object the data which will be used to generate the Composite key from
     */
    static compositeKey<T extends Model>(model: new () => T, obj: Partial<T>): ICompositeKey<T>;
    /**
     * Given a Model and a partial representation of that model, this will generate
     * a composite key in _string_ form that conforms to the `IPrimaryKey` interface
     * and uniquely identifies the given record.
     *
     * @param model the class definition of the model you want the CompositeKey for
     * @param object the data which will be used to generate the Composite key from
     */
    static compositeKeyRef<T extends Model>(model: new () => T, object: Partial<T>): string;
    /**
     * Returns the name of the name of the `Model`.
     *
     * Note: it returns the name in PascalCase _not_
     * camelCase.
     */
    static modelName<T extends Model>(model: new () => T): string;
    private _existsOnDB;
    private _writeOperations;
    private _data?;
    constructor(model: new () => T, options?: IRecordOptions);
    get data(): Readonly<T>;
    get isDirty(): boolean;
    /**
     * deprecated
     */
    set isDirty(value: boolean);
    /**
     * returns the fully qualified name in the database to this record;
     * this of course includes the record id so if that's not set yet calling
     * this getter will result in an error
     */
    get dbPath(): string;
    /**
     * provides a boolean flag which indicates whether the underlying
     * model has a "dynamic path" which ultimately comes from a dynamic
     * component in the "dbOffset" property defined in the model decorator
     */
    get hasDynamicPath(): boolean;
    /**
     * **dynamicPathComponents**
     *
     * An array of "dynamic properties" that are derived fom the "dbOffset" to
     * produce the "dbPath"
     */
    get dynamicPathComponents(): (keyof T & string)[];
    /**
     * the list of dynamic properties in the "localPrefix"
     * which must be resolved to achieve the "localPath"
     */
    get localDynamicComponents(): (keyof T & string)[];
    /**
     * A hash of values -- including at least "id" -- which represent
     * the composite key of a model.
     */
    get compositeKey(): ICompositeKey<T>;
    /**
     * a string value which is used in relationships to fully qualify
     * a composite string (aka, a model which has a dynamic dbOffset)
     */
    get compositeKeyRef(): string;
    /**
     * The Record's primary key; this is the `id` property only. Not
     * the composite key.
     */
    get id(): string;
    /**
     * Allows setting the Record's `id` if it hasn't been set before.
     * Resetting the `id` is not allowed.
     */
    set id(val: string);
    /**
     * Returns the record's database _offset_ without the ID or any dynamic properties
     * yet interjected. The _dynamic properties_ however, will be show with a `:` prefix
     * to indicate where the the values will go.
     */
    get dbOffset(): string;
    /**
     * returns the record's location in the frontend state management framework;
     * this can include dynamic properties characterized in the path string by
     * leading ":" character.
     */
    get localPath(): any;
    /**
     * The path in the local state tree that brings you to
     * the record; this is differnt when retrieved from a
     * Record versus a List.
     */
    get localPrefix(): string;
    get existsOnDB(): boolean;
    /** indicates whether this record is already being watched locally */
    get isBeingWatched(): boolean;
    get modelConstructor(): new () => T;
    /**
     * Goes out to the database and reloads this record
     */
    reload(): Promise<Record<T>>;
    /**
     * addAnother
     *
     * Allows a simple way to add another record to the database
     * without needing the model's constructor fuction. Note, that
     * the payload of the existing record is ignored in the creation
     * of the new.
     *
     * @param payload the payload of the new record
     */
    addAnother(payload: T, options?: IRecordOptions): Promise<Record<T>>;
    isSameModelAs(model: new () => any): boolean;
    /**
     * Pushes new values onto properties on the record
     * which have been stated to be a "pushKey"
     */
    pushKey<K extends keyof T & string, Object>(property: K, value: T[K][keyof T[K]] | any): Promise<fk>;
    /**
     * **update**
     *
     * Updates a set of properties on a given model atomically (aka, all at once);
     * will automatically include the "lastUpdated" property. Does NOT
     * allow relationships to be included, this should be done separately.
     *
     * If you want to remove a particular property but otherwise leave the object
     * unchanged, you can set that values(s) to NULL and it will be removed without
     * impact to other properties.
     *
     * @param props a hash of name value pairs which represent the props being
     * updated and their new values
     */
    update(props: Nullable<Partial<T>>): Promise<void>;
    /**
     * **remove**
     *
     * Removes the active record from the database and dispatches the change to
     * FE State Mgmt.
     */
    remove(): Promise<void>;
    /**
     * Changes the local state of a property on the record
     *
     * @param prop the property on the record to be changed
     * @param value the new value to set to
     * @param silent a flag to indicate whether the change to the prop should be updated
     * to the database or not
     */
    set<K extends keyof T>(prop: K & string, value: T[K], silent?: boolean): Promise<void>;
    /**
     * **associate**
     *
     * Associates the current model with another entity
     * regardless if the cardinality
     */
    associate(property: keyof T & string, refs: IFkReference<any> | Array<IFkReference<any>>, options?: IFmRelationshipOptions): Promise<void>;
    /**
     * **disassociate**
     *
     * Removes an association between the current model and another entity
     * (regardless of the cardinality in the relationship)
     */
    disassociate(property: keyof T & string, refs: IFkReference<any> | Array<IFkReference<any>>, options?: IFmRelationshipOptions): Promise<void>;
    /**
     * Adds one or more fk's to a hasMany relationship.
     *
     * Every relationship will be added as a "single transaction", meaning that ALL
     * or NONE of the relationshiop transactions will succeed. If you want to
     * take a more optimistic approach that accepts each relationship pairing (PK/FK)
     * then you should manage the iteration outside of this call and let this call
     * only manage the invidual PK/FK transactions (which should ALWAYS be atomic).
     *
     * @param property the property which is acting as a foreign key (array)
     * @param fkRefs FK reference (or array of FKs) that should be added to reln
     * @param options change the behavior of this relationship transaction
     */
    addToRelationship(property: keyof T & string, fkRefs: IFkReference<any> | Array<IFkReference<any>>, options?: IFmRelationshipOptionsForHasMany): Promise<void>;
    /**
     * removeFromRelationship
     *
     * remove one or more FK's from a `hasMany` relationship
     *
     * @param property the property which is acting as a FK
     * @param fkRefs the FK's on the property which should be removed
     */
    removeFromRelationship(property: keyof T & string, fkRefs: IFkReference<any> | Array<IFkReference<any>>, options?: IFmRelationshipOptionsForHasMany): Promise<void>;
    /**
     * **clearRelationship**
     *
     * clears an existing FK on a `hasOne` relationship or _all_ FK's on a
     * `hasMany` relationship
     *
     * @param property the property containing the relationship to an external
     * entity
     */
    clearRelationship(property: keyof T & string, options?: IFmRelationshipOptions): Promise<void>;
    /**
     * **setRelationship**
     *
     * sets up an FK relationship for a _hasOne_ relationship
     *
     * @param property the property containing the hasOne FK
     * @param ref the FK
     */
    setRelationship(property: keyof T & string, fkId: IFkReference<any>, options?: IFmRelationshipOptions): Promise<void>;
    /**
     * get a property value from the record
     *
     * @param prop the property being retrieved
     */
    get<K extends keyof T & string>(prop: K): Readonly<T>[K];
    toString(): string;
    toJSON(): {
        dbPath: string;
        modelName: string;
        pluralName: any;
        key: string;
        compositeKey: ICompositeKey<T>;
        localPath: any;
        data: string;
    };
    /**
     * Allows an empty Record to be initialized to a known state.
     * This is not intended to allow for mass property manipulation other
     * than at time of initialization
     *
     * @param data the initial state you want to start with
     */
    _initialize(data: Partial<T>, options?: IRecordOptions): Promise<void>;
    /**
     * **_writeAudit**
     *
     * Writes an audit log if the record is configured for audit logs
     */
    protected _writeAudit(action: IFmCrudOperations, currentValue: Partial<T>, priorValue: Partial<T>): Promise<void>;
    /**
     * **_localCrudOperation**
     *
     * updates properties on a given Record while firing
     * two-phase commit EVENTs to dispatch:
     *
     *  local: `RECORD_[ADDED,CHANGED,REMOVED]_LOCALLY`
     *  server: `RECORD_[ADDED,CHANGED,REMOVED]_CONFIRMATION`
     *
     * Note: if there is an error a
     * `RECORD_[ADDED,CHANGED,REMOVED]_ROLLBACK` event will be sent
     * to dispatch instead of the server dispatch message
     * illustrated above.
     *
     * Another concept that is sometimes not clear ... when a
     * successful transaction is achieved you will by default get
     * both sides of the two-phase commit. If you have a watcher
     * watching this same path then that watcher will also get
     * a dispatch message sent (e.g., RECORD_ADDED, RECORD_REMOVED, etc).
     *
     * If you only want to hear about Firebase's acceptance of the
     * record from a watcher then you can opt-out by setting the
     * { silentAcceptance: true } parameter in options. If you don't
     * want either side of the two phase commit sent to dispatch
     * you can mute both with { silent: true }. This option is not
     * typically a great idea but it can be useful in situations like
     * _mocking_
     */
    protected _localCrudOperation<K extends IFMEventName<K>>(crudAction: IFmCrudOperations, priorValue: T, options?: IFmDispatchOptions): Promise<void>;
    private _findDynamicComponents;
    /**
     * looks for ":name" property references within the dbOffset or localPrefix and expands them
     */
    private _injectDynamicPathProperties;
    /**
     * Load data from a record in database; works with `get` static initializer
     */
    private _getFromDB;
    /**
     * Allows for the static "add" method to add a record
     */
    private _adding;
}
