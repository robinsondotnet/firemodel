import { RealTimeDB } from "abstracted-firebase";
import { Model, Record } from "..";
import { IDictionary } from "common-types";
import { IMockConfig } from "./types";
/** adds mock values for all the properties on a given model */
export default function mockProperties<T extends Model>(db: RealTimeDB, config: IMockConfig, exceptions: IDictionary): (record: Record<T>) => Promise<Record<T>>;
