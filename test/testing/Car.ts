import { model, Model, property, hasOne, fk, hasMany, index } from "../../src";
import { mock } from "../../src/decorators";
import { Company } from "./Company";
import { Person } from "./Person";
import { FancyPerson } from "./FancyPerson";

function modelYear() {
  return 2018 - Math.floor(Math.random() * 10);
}

@model({ dbOffset: "car-offset" })
export class Car extends Model {
  @property public model: string;
  @property public cost: number;
  // prettier-ignore
  @property @mock(modelYear) @index public modelYear: number;
  // prettier-ignore
  @hasOne(() => FancyPerson) public owner?: fk;
}
