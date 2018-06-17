import { model, Model, property, ownedBy, fk, hasMany } from "../../src";
import { mock } from "../../src/decorators/property";
import { Company } from "./company";

function modelYear() {
  return 2018 - Math.floor(Math.random() * 10);
}

@model({})
export class Car extends Model {
  @property public model: string;
  @property public cost: number;
  // prettier-ignore
  @property @mock(modelYear) public modelYear: number;
}