import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { Model } from "../../Model";
export declare class MissingReciprocalInverse<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: keyof T & string);
}
