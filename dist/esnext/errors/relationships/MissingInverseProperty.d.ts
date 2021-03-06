import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { Model } from "../../Model";
/**
 * When the record's META points to a inverse property on the FK; this error
 * presents when that `FK[inverseProperty]` doesn't exist in the FK's meta.
 */
export declare class MissingInverseProperty<T extends Model> extends FireModelError {
    from: string;
    to: string;
    inverseProperty: string;
    constructor(rec: Record<T>, property: keyof T & string);
}
