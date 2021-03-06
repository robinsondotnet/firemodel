import { FireModelError } from "../FireModelError";
import { Model } from "../../Model";
export declare class DuplicateRelationship<P extends Model, F extends Model> extends FireModelError {
    constructor(pk: P, property: string, fkId: string);
}
