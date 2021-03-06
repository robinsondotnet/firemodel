/**
 * sets the `Record` property to the optimistic values set
 * with the relationship CRUD event.
 *
 * This function has no concern with dispatch or the FK model
 * and any updates that may need to take place there.
 */
export function locallyUpdateFkOnRecord(rec, fkId, event) {
    const relnType = rec.META.relationship(event.property).relType;
    // update lastUpdated but quietly as it will be updated again
    // once server responds
    rec.set("lastUpdated", new Date().getTime(), true);
    // now work on a per-op basis
    switch (event.operation) {
        case "set":
        case "add":
            rec._data[event.property] =
                relnType === "hasMany"
                    ? Object.assign(Object.assign({}, rec.data[event.property]), { [fkId]: true }) : fkId;
            return;
        case "remove":
            if (relnType === "hasMany") {
                delete rec._data[event.property][fkId];
            }
            else {
                rec._data[event.property] = "";
            }
            return;
    }
}
//# sourceMappingURL=locallyUpdateFkOnRecord.js.map