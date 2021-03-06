import { Model } from "../Model";
import { IModelConstructor } from "..";
import Dexie, { IndexableType } from "dexie";
import { IDexieModelMeta, IDexieListOptions } from "../@types/optional/dexie";
import { DexieError } from "../errors";
import { capitalize } from "../util";
import { IComparisonOperator } from "serialized-query";
import { epoch } from "common-types";
import { PropType } from "../@types/index";
import { reverse } from "dns";

/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
export class DexieList<T extends Model> {
  constructor(
    private modelConstructor: IModelConstructor<T>,
    private table: Dexie.Table<T, any>,
    private meta: IDexieModelMeta
  ) {}

  /**
   * Get a full list of _all_ records of a given model type
   */
  async all(
    options: IDexieListOptions<T> = {
      orderBy: "lastUpdated"
    }
  ) {
    // TODO: had to remove the `orderBy` for models with a composite key; no idea why!
    const c = this.meta.hasDynamicPath
      ? this.table
      : this.table.orderBy(options.orderBy);
    if (options.limit) {
      c.limit(options.limit);
    }
    if (options.offset) {
      c.offset(options.offset);
    }

    return c.toArray().catch(e => {
      throw new DexieError(
        `Problem with list(${capitalize(
          this.meta.modelName
        )}).all(${options}): ${e.message}`,
        `dexie/${e.code || e.name || "list.all"}`
      );
    });
  }

  /**
   * Limit the list of records based on the evaluation of a single
   * properties value. Default comparison is equality but you can
   * change the `value` to a Tuple and include the `<` or `>` operator
   * as the first param to get other comparison operators.
   */
  async where<K extends keyof T>(
    prop: K & string,
    value: PropType<T, K> | [IComparisonOperator, PropType<T, K>],
    options: IDexieListOptions<T> = {}
  ) {
    // const c = this.table.orderBy(options.orderBy || "lastUpdated");
    const [op, val] =
      Array.isArray(value) && ["=", ">", "<"].includes(value[0])
        ? value
        : ["=", value];

    let query =
      op === "="
        ? this.table.where(prop).equals(val as IndexableType)
        : op === ">"
        ? this.table.where(prop).above(val as IndexableType)
        : this.table.where(prop).below(val as IndexableType);

    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.offset(options.offset);
    }

    return query.toArray().catch(e => {
      throw new DexieError(
        `list.where(${prop}, ${value}, ${JSON.stringify(
          options
        )}) failed to execute: ${e.message}`,
        `dexie/${e.code || e.name || "list.where"}`
      );
    });
  }

  /**
   * Get the "_x_" most recent records of a given type (based on the
   * `lastUpdated` property).
   */
  async recent(limit: number, skip?: number) {
    const c = skip
      ? this.table
          .orderBy("lastUpdated")
          .reverse()
          .limit(limit)
          .offset(skip)
      : this.table
          .orderBy("lastUpdated")
          .reverse()
          .limit(limit);

    return c.toArray();
  }

  /**
   * Get all records updated since a given timestamp.
   */
  async since(datetime: epoch, options: IDexieListOptions<T> = {}) {
    return this.where("lastUpdated", [">", datetime]);
  }

  /**
   * Get the _last_ "x" records which were created.
   */
  async last(limit: number, skip?: number) {
    const c = skip
      ? this.table
          .orderBy("createdAt")
          .reverse()
          .limit(limit)
          .offset(skip)
      : this.table
          .orderBy("createdAt")
          .reverse()
          .limit(limit);

    return c.toArray();
  }

  /**
   * Get the _first_ "x" records which were created (aka, the earliest records created)
   */
  async first(limit: number, skip?: number) {
    const c = skip
      ? this.table
          .orderBy("createdAt")
          .limit(limit)
          .offset(skip)
      : this.table.orderBy("createdAt").limit(limit);

    return c.toArray();
  }
}
