import {
  model,
  Model,
  property,
  ownedBy,
  fk,
  hasMany,
  min,
  inverse,
  pushKey,
  max,
  length
} from "../../src";
import { mock } from "../../src/decorators/property";
import { Company } from "./company";
import { IDictionary } from "common-types";

function bespokeMock(context: import("firemock").MockHelper) {
  return context.faker.name.firstName() + ", hello to you";
}

@model({ dbOffset: "authenticated", audit: true })
export class Person extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  // prettier-ignore
  @property @min(1) @max(100) public age?: number;
  @property public gender?: "male" | "female" | "other";
  @property public scratchpad?: IDictionary;
  // prettier-ignore
  @property @pushKey public tags?: IDictionary<string>;
  // prettier-ignore
  @ownedBy(Person) @inverse("children") public mother?: fk;
  // prettier-ignore
  @ownedBy(Person) @inverse("children") public father?: fk;
  // prettier-ignore
  @hasMany(Person) public children?: IDictionary;
  // prettier-ignore
  // @ownedBy(Concert) public concerts?: IDictionary;
  @ownedBy(Company) public employerId?: fk;
}