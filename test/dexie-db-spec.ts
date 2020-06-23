// tslint:disable: no-implicit-dependencies
// tslint:disable: no-submodule-imports
import { DexieDb } from "../src/dexie/DexieDb";
import { Car } from "./testing/Car";
import { Person } from "./testing/Person";
import { DeeperPerson } from "./testing/dynamicPaths/DeeperPerson";

import "./testing/fake-indexeddb";
import indexedDB from "fake-indexeddb";
import fdbKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import DeepPerson from "./testing/dynamicPaths/DeepPerson";

DexieDb.indexedDB(indexedDB, fdbKeyRange);

const cars = [
  {
    id: "123",
    model: "Volt",
    cost: 23000,
    modelYear: 2018,
    lastUpdated: 231231,
    createAt: 8980
  },
  {
    id: "456",
    model: "350e",
    cost: 46000,
    modelYear: 2016,
    lastUpdated: 231232,
    createAt: 8981
  },
  {
    id: "789",
    model: "A3",
    cost: 50000,
    modelYear: 2019,
    lastUpdated: 231233,
    createAt: 8982
  }
];

describe("DexieModel => ", () => {
  it("DexieModel can be instantiated with single Model", async () => {
    const d = new DexieDb("testing", Car);
    expect(d).toBeInstanceOf(DexieDb);
    expect(d.dbName).toBe("testing");
  });

  it("DexieModel can be instantiated with multiple Models", async () => {
    const d = new DexieDb("testing", Car, Person);
    expect(d).toBeInstanceOf(DexieDb);
    expect(d.dbName).toBe("testing");
    expect(d.modelNames).toEqual(expect.arrayContaining(["car"]));
    expect(d.modelNames).toEqual(expect.arrayContaining(["person"]));
  });

  it(
    "meta information lookup works with singular and plural model name",
    async () => {
      const d = new DexieDb("testing", Car);
      expect(d.meta("car")).toBeInstanceOf("object");
      expect(d.meta("car").allProperties).toBeInstanceOf("array");
      expect(d.meta("cars")).toBeInstanceOf("object");
      expect(d.meta("cars").allProperties).toBeInstanceOf("array");
    }
  );

  it(
    "Dexie model definition works for static pathed model with non-unique index",
    async () => {
      const d = new DexieDb("testing", Car);
      expect(d.models.cars).toBeInstanceOf("string");
      expect(d.models.cars).toEqual(expect.arrayContaining(["&id"]));
      expect(d.models.cars).toEqual(expect.arrayContaining(["modelYear"]));
      expect(d.models.cars).toEqual(expect.not.arrayContaining(["&modelYear"]));
      expect(d.models.cars).toEqual(expect.arrayContaining(["lastUpdated"]));
      expect(d.models.cars).toEqual(expect.arrayContaining(["createdAt"]));
    }
  );

  it("Dexie model definition works for dynamically pathed model", async () => {
    const d = new DexieDb("testing", DeeperPerson);
    expect(d.models.deeperPeople).toBeInstanceOf("string");
    expect(d.models.deeperPeople).toEqual(expect.arrayContaining(["[id+group+subGroup]"]));
    expect(d.models.deeperPeople).toEqual(expect.not.arrayContaining(["&id"]));
    expect(d.models.deeperPeople).toEqual(expect.arrayContaining(["lastUpdated"]));
    expect(d.models.deeperPeople).toEqual(expect.arrayContaining(["createdAt"]));
  });

  it("calling addPriorVersion() once increments the version", async () => {
    const d = new DexieDb("testing", Car);
    expect(d.version).toBe(1);
    const fluent = d.addPriorVersion({ models: { cars: "&id" } });
    expect(d.version).toBe(2);
    expect(fluent).toBeInstanceOf(DexieDb);
  });

  it("table() method returns a Dexie.Table class", async () => {
    const d = new DexieDb("testing", Car);
    const t = d.table(Car);
    expect(t).toBeInstanceOf("object");
    expect(t.add).toBeInstanceOf("function");
    expect(t.bulkAdd).toBeInstanceOf("function");
    expect(t.bulkPut).toBeInstanceOf("function");
  });

  it("table() gets back valid schema properties", async () => {
    const d = new DexieDb("testing", Car);
    const t = d.table(Car);
    expect(t.schema.name).toBe("cars");
    expect(t.schema.mappedClass).toBeInstanceOf("function");
    expect(t.schema.primKey.name).toBe("id");
  });

  it("table.schema is good for both dynamic and static models", async () => {
    const d = new DexieDb("testing", Car, DeepPerson);
    const fancyCars = d.table(Car);
    const people = d.table(DeepPerson);

    expect(fancyCars.schema.primKey.name).toBe("id");
    expect(fancyCars.schema.primKey.keyPath).toBe("id");

    let uniqueIndexes = fancyCars.schema.indexes
      .filter(i => i.unique)
      .map(i => i.name);
    let nonUniqueIndexes = fancyCars.schema.indexes
      .filter(i => !i.unique)
      .map(i => i.name);

    expect(nonUniqueIndexes).toEqual(expect.arrayContaining(["modelYear"]));

    expect(people.schema.primKey.name).toBe("[id+group]");
    expect(people.schema.primKey.keyPath).toEqual(expect.arrayContaining(["group"]));

    uniqueIndexes = people.schema.indexes
      .filter(i => i.unique)
      .map(i => i.name);
    nonUniqueIndexes = people.schema.indexes
      .filter(i => !i.unique)
      .map(i => i.name);

    expect(nonUniqueIndexes).toEqual(expect.arrayContaining(["createdAt"]));

    expect(nonUniqueIndexes).toHaveLength(4);
  });

  it("table() allows for bulkAdd() then get()", async () => {
    const db = new DexieDb("foobar", Car);
    if (db.isOpen()) {
      db.close();
    }
    await db.open().catch(e => {
      console.log(e);
    });

    const t = db.table(Car);
    await t.bulkPut(cars).catch(e => {
      throw new Error(e);
    });
    const car: Car = await t.get("123").catch(e => {
      throw new Error(e);
    });

    expect(car).toBeInstanceOf(Car);
    const expected = cars.find(i => i.id === "123");
    expect(car.modelYear).toBe(expected.modelYear);
  });
});
