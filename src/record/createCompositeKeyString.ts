import { Model, Record, createCompositeKey } from "..";
import { IDictionary } from "common-types";

/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export function createCompositeKeyRefFromRecord<T extends Model = Model>(
  rec: Record<T>
) {
  const cKey: IDictionary & { id: string } = createCompositeKey(rec);
  return rec.hasDynamicPath ? createCompositeRef(cKey) : rec.id;
}

/**
 * Given a hash/dictionary (with an `id` prop), will generate a "composite
 * reference" in string form.
 */
export function createCompositeRef(cKey: IDictionary & { id: string }) {
  return Object.keys(cKey).length > 1
    ? cKey.id +
        Object.keys(cKey)
          .filter(k => k !== "id")
          .map(k => `::${k}:${cKey[k]}`)
    : cKey.id;
}
