import { model, Model, property, hasOne, fk, mock } from "../../../src";

@model({ dbOffset: "up" })
export class UserProfile extends Model {
  /** the user's name */
  @property @mock("name") name: string;
  @property @mock("uuid") uid: string;
  @property @mock("firstName") nickname?: string;
}
