import { Record } from "../Record";
import { FMEvents } from "..";
import { getModelMeta } from "../ModelMeta";
import { UnknownRelationshipProblem } from "../errors/relationships/UnknownRelationshipProblem";
import { reduceHashToRelativePaths } from "./reduceHashToRelativePaths";
import { extractFksFromPaths } from "./extractFksFromPaths";
import { locallyUpdateFkOnRecord } from "./locallyUpdateFkOnRecord";
/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers where ever possible
 */
export async function relationshipOperation(rec, 
/**
 * **operation**
 *
 * The relationship operation that is being executed
 */
operation, 
/**
 * **property**
 *
 * The property on this model which changing its relationship status in some way
 */
property, 
/**
 * **paths**
 *
 * a set of name value pairs where the `name` is the DB path that needs updating
 * and the value is the value to set.
 */
paths, options = {}) {
    const dispatchEvents = {
        set: [
            FMEvents.RELATIONSHIP_SET_LOCALLY,
            FMEvents.RELATIONSHIP_SET_CONFIRMATION,
            FMEvents.RELATIONSHIP_SET_ROLLBACK
        ],
        clear: [
            FMEvents.RELATIONSHIP_REMOVED_LOCALLY,
            FMEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            FMEvents.RELATIONSHIP_REMOVED_ROLLBACK
        ],
        // update: [
        //   FMEvents.RELATIONSHIP_UPDATED_LOCALLY,
        //   FMEvents.RELATIONSHIP_UPDATED_CONFIRMATION,
        //   FMEvents.RELATIONSHIP_UPDATED_ROLLBACK
        // ],
        add: [
            FMEvents.RELATIONSHIP_ADDED_LOCALLY,
            FMEvents.RELATIONSHIP_ADDED_CONFIRMATION,
            FMEvents.RELATIONSHIP_ADDED_ROLLBACK
        ],
        remove: [
            FMEvents.RELATIONSHIP_REMOVED_LOCALLY,
            FMEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            FMEvents.RELATIONSHIP_REMOVED_ROLLBACK
        ]
    };
    try {
        const [localEvent, confirmEvent, rollbackEvent] = dispatchEvents[operation];
        const fkRecord = Record.create(rec.META.relationship(property).fkConstructor());
        const fkMeta = getModelMeta(fkRecord.data);
        const transactionId = "t-reln-" +
            Math.random()
                .toString(36)
                .substr(2, 5) +
            "-" +
            Math.random()
                .toString(36)
                .substr(2, 5);
        try {
            await localRelnOp(rec, operation, property, paths, localEvent);
        }
        catch (e) {
            await relnRollback(rec, operation, property, paths, rollbackEvent, e);
        }
        await relnConfirmation(rec, operation, property, paths, confirmEvent);
    }
    catch (e) {
        if (e.firemodel) {
            throw e;
        }
        else {
            throw new UnknownRelationshipProblem(e, rec, property, operation);
        }
    }
}
export async function localRelnOp(rec, op, prop, paths, event) {
    // locally modify Record's values
    const ids = extractFksFromPaths(rec, prop, paths);
    ids.map(id => {
        locallyUpdateFkOnRecord(rec, op, prop, id);
    });
    // build MPS
    const dbPaths = reduceHashToRelativePaths(paths);
    const mps = rec.db.multiPathSet(dbPaths.root);
    dbPaths.paths.map(p => mps.add({ path: p.path, value: p.value }));
    // execute MPS on DB
    try {
        await mps.execute();
    }
    catch (e) {
        // TODO: complete err handling
        throw e;
    }
}
export async function relnConfirmation(rec, op, prop, paths, event) {
    //
}
export async function relnRollback(rec, op, prop, paths, event, err) {
    //
}
//# sourceMappingURL=relationshipOperation.js.map