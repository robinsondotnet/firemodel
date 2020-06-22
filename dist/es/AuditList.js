import { AuditBase } from "./AuditBase";
import { SerializedQuery } from "universal-fire";
import { pathJoin } from "./path";
export class AuditList extends AuditBase {
    constructor(modelKlass, options = {}) {
        super(modelKlass, options);
        this._query = SerializedQuery.create(this.db, pathJoin(this.dbPath, "all"));
    }
    async first(howMany, offset = 0) {
        this._query = this._query.limitToFirst(howMany).startAt(offset);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async last(howMany, offset = 0) {
        this._query = this._query.limitToLast(howMany).startAt(offset);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async since(when) {
        this._query = this._query.orderByChild("createdAt").startAt(when);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async before(when) {
        this._query = this._query.orderByChild("createdAt").endAt(when);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async between(from, to) {
        this._query = this._query.orderByChild("createdAt").startAt(from).endAt(to);
        const log = await this.db.getList(this._query);
        return log || [];
    }
}
//# sourceMappingURL=AuditList.js.map