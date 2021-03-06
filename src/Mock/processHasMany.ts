import { Mock, Record, IFmModelRelationshipMeta } from "..";
import { IMockConfig, IMockResponse } from "./types";
import { RealTimeDB } from "abstracted-firebase";

export async function processHasMany<T>(
  record: Record<T>,
  rel: IFmModelRelationshipMeta<T>,
  config: IMockConfig,
  db: RealTimeDB
): Promise<IMockResponse<T>> {
  // by creating a mock we are giving any dynamic path segments
  // an opportunity to be mocked (this is best practice)
  const fkMockMeta = (await Mock(rel.fkConstructor(), db).generate(1)).pop();
  const prop: Extract<keyof T, string> = rel.property as any;
  if (rel.property === "cars") {
    const fkRec = Record.create(rel.fkConstructor());
  }

  await record.addToRelationship(prop, fkMockMeta.compositeKey);
  if (config.relationshipBehavior === "link") {
    await db.remove(fkMockMeta.dbPath);
    return;
  }

  return fkMockMeta;
}
