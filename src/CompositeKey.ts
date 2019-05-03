import { IDictionary } from "common-types";
import { Record, Model } from "./index";
import { ICompositeKey } from "./@types/record-types";

export function createCompositeKey<T extends Model = Model>(
  rec: Record<T>
): ICompositeKey {
  const model = rec.data;
  return {
    ...{ id: rec.id },
    ...rec.dynamicPathComponents.reduce(
      (prev, key) => ({
        ...prev,
        ...{ [key]: model[key as keyof typeof model] }
      }),
      {}
    )
  };
}

/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export function createCompositeKeyString<T extends Model = Model>(
  rec: Record<T>
) {
  const cKey: IDictionary = createCompositeKey(rec);
  return rec.hasDynamicPath
    ? cKey.id +
        Object.keys(cKey)
          .filter(k => k !== "id")
          .map(k => `::${k}:${cKey[k]}`)
    : rec.id;
}
