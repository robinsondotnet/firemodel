import { key as fbKey } from "firebase-key";
import { DexieError } from "../errors";
import { capitalize } from "../util";
/**
 * Provides a simple API to do CRUD operations
 * on Dexie/IndexDB which resembles the Firemodel
 * API.
 */
export class DexieRecord {
    constructor(modelConstructor, table, meta) {
        this.modelConstructor = modelConstructor;
        this.table = table;
        this.meta = meta;
    }
    /**
     * Gets a specific record from the **IndexDB**; if record is not found the
     * `dexie/record-not-found` error is thrown.
     *
     * @param pk the primary key for the record; which is just the `id` in many cases
     * but becomes a `CompositeKey` if the model has a dynamic path.
     */
    async get(pk) {
        return this.table.get(pk).catch(e => {
            throw new DexieError(`DexieRecord: problem getting record ${JSON.stringify(pk)} of model ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "get"}`);
        });
    }
    /**
     * Adds a new record of _model_ `T`; if an `id` is provided it is used otherwise
     * it will generate an id using the client-side library 'firebase-key'.
     *
     * @param record the dictionary representing the new record
     */
    async add(record) {
        if (this.meta.hasDynamicPath) {
            if (!this.meta.dynamicPathComponents.every(i => record[i])) {
                throw new DexieError(`The model ${capitalize(this.meta.modelName)} is based on a dynamic path [ ${this.meta.dynamicPathComponents.join(", ")} ] and every part of this path is therefore a required field but the record hash passed in did not define values for all these properties. The properties which WERE pass in included: ${Object.keys(record).join(", ")}`, "dexie/missing-property");
            }
        }
        if (!record.id) {
            record.id = fbKey();
        }
        const now = new Date().getTime();
        record.createdAt = now;
        record.lastUpdated = now;
        const pk = await this.table.add(record).catch(e => {
            throw new DexieError(`DexieRecord: Problem adding record to ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "add"}`);
        });
        return this.get(pk);
    }
    /**
     * Update an existing record in the **IndexDB**
     */
    async update(pk, updateHash) {
        const now = new Date().getTime();
        updateHash.lastUpdated = now;
        const result = await this.table.update(pk, updateHash).catch(e => {
            throw new DexieError(`DexieRecord: Problem updating ${capitalize(this.meta.modelName)}.${typeof pk === "string" ? pk : pk.id}: ${e.message}`, `dexie/${e.code || e.name || "update"}`);
        });
        if (result === 0) {
            throw new DexieError(`The primary key passed in to record.update(${JSON.stringify(pk)}) was NOT found in the IndexedDB!`, "dexie/record-not-found");
        }
        if (result > 1) {
            throw new DexieError(`While calling record.update(${JSON.stringify(pk)}) MORE than one record was updated!`, "dexie/unexpected-error");
        }
    }
    async remove(id) {
        return this.table.delete(id).catch(e => {
            throw new DexieError(`Problem removing record ${JSON.stringify(id)} from the ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "remove"}`);
        });
    }
}
//# sourceMappingURL=DexieRecord.js.map