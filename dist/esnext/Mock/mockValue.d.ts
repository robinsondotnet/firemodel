import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { Model, IFmModelPropertyMeta } from "..";
import { MockHelper } from "firemock";
export default function mockValue<T extends Model>(db: AbstractedDatabase, propMeta: IFmModelPropertyMeta<T>, mockHelper: MockHelper, ...rest: any[]): any;
