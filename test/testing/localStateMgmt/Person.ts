import { Model, property, min, max, length, model } from "../../../src";

@model({ localPrefix: "foo/bar" })
export class Person extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  // prettier-ignore
  @property @min(1) @max(100) public age?: number;
  @property public gender?: "male" | "female" | "other";
}
