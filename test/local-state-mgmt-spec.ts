// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
const expect = chai.expect;
import { DB } from "abstracted-admin";
import { FireModel, Record, List, pathJoin } from "../src";
import { Person } from "./testing/localStateMgmt/Person";
import { DynamicPerson } from "./testing/localStateMgmt/DynamicPerson";
import { PostfixPerson } from "./testing/localStateMgmt/PostfixPerson";

describe("Client state management", () => {
  let db: DB;
  before(async () => {
    db = await DB.connect({ mocking: true });
    FireModel.defaultDb = db;
  });

  it("when using a RECORD, the localPath is equal to the prefix plus 'localModelName' if there are no dynamic components", async () => {
    const person = await Record.create(Person);
    expect(person.localPath).to.equal(
      person.localPrefix + "/" + person.META.localModelName
    );
    expect(person.localDynamicComponents)
      .to.be.an("array")
      .and.have.lengthOf(0);
  });
  it("when using a RECORD, dynamic components from localPrefix are expanded in localPath", async () => {
    const person = await Record.create(DynamicPerson);
    person.id = "1234";
    expect(person.localDynamicComponents).to.contain("id");
    expect(person.localPrefix).to.equal("/foo/bar/:id");
    expect(person.localPath).to.equal("/foo/bar/1234/dynamicPerson");
  });

  it("when using a LIST, the localPath is the prefix, pluralName (assuming no dynamic components)", async () => {
    const people = await List.all(Person);
    expect(
      people.localPath,
      `localPath should combine prefix [ ${people.META.localPrefix} ] and pluralName [ ${people.pluralName} ]`
    ).to.equal(pathJoin(people.META.localPrefix, people.pluralName));
    expect(people.localPostfix).to.equal("all");
  });

  it("when using a LIST, the localPath is the prefix, pluralName, and then the postFix if it is set", async () => {
    const people = await List.all(PostfixPerson);
    expect(people.META.localPostfix).to.equal("since");
    expect(people.localPath).to.equal(
      pathJoin(people.META.localPrefix, people.pluralName)
    );
    expect(people.localPostfix).to.equal("since");
  });
});
