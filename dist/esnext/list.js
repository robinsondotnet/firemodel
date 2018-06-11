import { Record } from "./index";
import { SerializedQuery } from "serialized-query";
import { Model } from "./model";
const DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";
export class List {
    constructor(_model, _data = []) {
        this._model = _model;
        this._data = _data;
    }
    static create(schema, options = {}) {
        const model = Model.create(schema, options);
        return new List(model);
    }
    /**
     * Creates a List<T> which is populated with the passed in query
     *
     * @param schema the schema type
     * @param query the serialized query; note that this LIST will override the path of the query
     * @param options model options
     */
    static async fromQuery(schema, query, options = {}) {
        const model = Model.create(schema, options);
        query.setPath(model.dbPath);
        const list = List.create(schema, options);
        await list.load(query);
        return list;
    }
    /**
     * Loads all the records of a given schema-type ordered by lastUpdated
     *
     * @param schema the schema type
     * @param options model options
     */
    static async all(schema, options = {}) {
        const query = new SerializedQuery().orderByChild("lastUpdated");
        const list = await List.fromQuery(schema, query, options);
        return list;
    }
    /**
     * Loads the first X records of the Schema type where
     * ordering is provided by the "createdAt" property
     *
     * @param schema the schema type
     * @param howMany the number of records to bring back
     * @param options model options
     */
    static async first(schema, howMany, options = {}) {
        const query = new SerializedQuery().orderByChild("createdAt").limitToLast(howMany);
        const list = await List.fromQuery(schema, query, options);
        return list;
    }
    /**
     * recent
     *
     * Get recent items of a given type/schema (based on lastUpdated)
     *
     * @param schema the TYPE you are interested
     * @param howMany the quantity to of records to bring back
     * @param offset start at an offset position (useful for paging)
     * @param options
     */
    static async recent(schema, howMany, offset = 0, options = {}) {
        const query = new SerializedQuery().orderByChild("lastUpdated").limitToFirst(howMany);
        const list = await List.fromQuery(schema, query, options);
        return list;
    }
    /**
     * since
     *
     * Bring back all records that have changed since a given date
     *
     * @param schema the TYPE you are interested
     * @param since  the datetime in miliseconds
     * @param options
     */
    static async since(schema, since, options = {}) {
        if (typeof since !== "number") {
            const e = new Error(`Invalid "since" parameter; value must be number instead got a(n) ${typeof since} [ ${since} ]`);
            e.name = "NotAllowed";
            throw e;
        }
        // const query = new SerializedQuery().orderByChild("lastUpdated").startAt(since);
        const query = new SerializedQuery().orderByChild("lastUpdated").startAt(since);
        console.log("QUERY", query);
        const list = await List.fromQuery(schema, query, options);
        return list;
    }
    static async inactive(schema, howMany, options = {}) {
        const query = new SerializedQuery().orderByChild("lastUpdated").limitToLast(howMany);
        const list = await List.fromQuery(schema, query, options);
        return list;
    }
    static async last(schema, howMany, options = {}) {
        const query = new SerializedQuery().orderByChild("createdAt").limitToFirst(howMany);
        const list = await List.fromQuery(schema, query, options);
        return list;
    }
    static async where(schema, property, value, options = {}) {
        let operation = "=";
        let val = value;
        if (Array.isArray(value)) {
            val = value[1];
            operation = value[0];
        }
        const query = new SerializedQuery().orderByChild(property).where(operation, val);
        const list = await List.fromQuery(schema, query, options);
        return list;
    }
    get length() {
        return this._data.length;
    }
    get db() {
        return this._model.db;
    }
    get modelName() {
        return this._model.modelName;
    }
    get pluralName() {
        return this._model.pluralName;
    }
    get dbPath() {
        return [this.meta.dbOffset, this.pluralName].join("/");
    }
    get localPath() {
        return [this.meta.localOffset, this.pluralName].join("/");
    }
    get meta() {
        return this._model.schema.META;
    }
    /** Returns another List with data filtered down by passed in filter function */
    filter(f) {
        return new List(this._model, this._data.filter(f));
    }
    /** Returns another List with data filtered down by passed in filter function */
    find(f, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
        const filtered = this._data.filter(f);
        const r = Record.create(this._model.schemaClass);
        if (filtered.length > 0) {
            r._initialize(filtered[0]);
            return r;
        }
        else {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            else {
                const e = new Error(`find(fn) did not find a value in the List [ length: ${this.data.length} ]`);
                e.name = "NotFound";
                throw e;
            }
        }
    }
    filterWhere(prop, value) {
        const whereFilter = (item) => item[prop] === value;
        return new List(this._model, this._data.filter(whereFilter));
    }
    /**
     * findWhere
     *
     * returns the first record in the list where the property equals the
     * specified value. If no value is found then an error is thrown unless
     * it is stated
     */
    findWhere(prop, value, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
        console.log(this._data);
        const list = this.filterWhere(prop, value);
        if (list.length > 0) {
            return Record.load(this._model.schemaClass, list._data[0]);
        }
        else {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            else {
                const e = new Error(`findWhere(${prop}, ${value}) was not found in the List [ length: ${this.data.length} ]`);
                e.name = "NotFound";
                throw e;
            }
        }
    }
    /**
     * provides a map over the data structured managed by the List; there will be no mutations to the
     * data managed by the list
     */
    map(f) {
        return this.data.map(f);
    }
    get data() {
        return this._data;
    }
    /**
     * Returns the specified record Record object
     *
     * @param id the unique ID which is being looked for
     * @param defaultIfNotFound the default value returned if the ID is not found in the list
     */
    get(id, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
        const find = this.filter(f => f.id === id);
        if (find.length === 0) {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            const e = new Error(`Could not find "${id}" in list of ${this._model.pluralName}`);
            e.name = "NotFound";
            throw e;
        }
        const r = new Record(this._model);
        r._initialize(find.data[0]);
        return r;
    }
    /**
     * Returns the single instance of an object contained by the List container
     *
     * @param id the unique ID which is being looked for
     * @param defaultIfNotFound the default value returned if the ID is not found in the list
     */
    getData(id, defaultIfNotFound = "__DO_NOT_USE__") {
        const record = this.get(id, defaultIfNotFound);
        return record === defaultIfNotFound ? defaultIfNotFound : record.data;
    }
    async load(pathOrQuery) {
        if (!this.db) {
            const e = new Error(`The attempt to load data into a List requires that the DB property be initialized first!`);
            e.name = "NoDatabase";
            throw e;
        }
        this._data = await this.db.getList(pathOrQuery);
        return this;
    }
}
//# sourceMappingURL=list.js.map