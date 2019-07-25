"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-implicit-dependencies
const abstracted_admin_1 = require("abstracted-admin");
const chai = __importStar(require("chai"));
const src_1 = require("../src");
const DeepPerson_1 = __importDefault(require("./testing/dynamicPaths/DeepPerson"));
const DeeperPerson_1 = require("./testing/dynamicPaths/DeeperPerson");
const Hobby_1 = __importDefault(require("./testing/dynamicPaths/Hobby"));
const helpers_1 = require("./testing/helpers");
const Company_1 = __importDefault(require("./testing/dynamicPaths/Company"));
const HumanAttribute_1 = require("./testing/dynamicPaths/HumanAttribute");
const expect = chai.expect;
describe("Dynamic offsets reflected in path", () => {
    let db;
    beforeEach(async () => {
        db = await abstracted_admin_1.DB.connect({ mocking: true });
        src_1.FireModel.defaultDb = db;
    });
    it("A single dynamic offset is added to dynamic offset", async () => {
        const person = await src_1.Record.add(DeepPerson_1.default, {
            name: {
                first: "Bob",
                last: "Marley"
            },
            age: 60,
            group: "foobar",
            phoneNumber: "555-1212"
        });
        expect(person.META.dbOffset).to.equal("/group/:group/testing");
        expect(person.dynamicPathComponents)
            .to.be.lengthOf(1)
            .and.contain("group");
        expect(person.dbPath).to.contain(`${person.data.group}/testing`);
    });
    it("Multiple dynamic offsets are included in dbPath", async () => {
        const person = await src_1.Record.add(DeeperPerson_1.DeeperPerson, {
            name: {
                first: "Bob",
                last: "Marley"
            },
            age: 60,
            group: "foo",
            subGroup: "bar",
            phoneNumber: "555-1212"
        });
        expect(person.META.dbOffset).to.equal(":group/:subGroup/testing");
        expect(person.dynamicPathComponents)
            .to.be.lengthOf(2)
            .and.contain("group")
            .and.contain("subGroup");
        expect(person.dbPath).to.contain(`${person.data.group}/${person.data.subGroup}/testing`);
    });
    it("Multiple dynamic offsets are used to set and get the correct path in the DB", async () => {
        const person = await src_1.Record.add(DeeperPerson_1.DeeperPerson, {
            name: {
                first: "Bob",
                last: "Marley"
            },
            age: 60,
            group: "foo",
            subGroup: "bar",
            phoneNumber: "555-1212"
        });
        expect(db.mock.db.foo.bar.testing).to.be.an("object");
        const pathToRecord = db.mock.db.foo.bar.testing.deeperPeople[person.id];
        expect(pathToRecord).to.be.an("object");
        expect(pathToRecord.age).to.equal(person.data.age);
        const p2 = await src_1.Record.get(DeeperPerson_1.DeeperPerson, {
            id: person.id,
            group: person.data.group,
            subGroup: person.data.subGroup
        });
        expect(p2.id).to.equal(person.id);
        expect(p2.data.age).to.equal(person.data.age);
    });
});
describe("Dynamic offsets work with relationships", () => {
    let person;
    let db;
    let hobbies;
    beforeEach(async () => {
        db = await abstracted_admin_1.DB.connect({ mocking: true });
        src_1.FireModel.defaultDb = db;
        person = await src_1.Record.add(DeepPerson_1.default, {
            name: {
                first: "Joe",
                last: "Blow"
            },
            age: 30,
            group: "test",
            phoneNumber: "555-1234"
        });
        await src_1.Mock(Hobby_1.default, db).generate(4);
        hobbies = await src_1.List.all(Hobby_1.default);
    });
    it("addToRelationship works for M:M (where FK is without dynamic segment)", async () => {
        await person.addToRelationship("hobbies", hobbies.data[0].id);
        // FK reference should be standard ID key
        expect(person.data.hobbies).to.haveOwnProperty(hobbies.data[0].id);
        const hobby = await src_1.Record.get(Hobby_1.default, hobbies.data[0].id);
        // FK model should have composite key pointing back to DeepPerson
        expect(helpers_1.firstKey(hobby.data.practitioners)).to.equal(`${person.id}::group:test`);
    });
    it("addToRelationship works for M:M (FK has shared dynamic segment; using implicit composite key)", async () => {
        const motherId = (await src_1.Mock(DeepPerson_1.default).generate(1, {
            age: 55,
            group: "test"
        })).pop();
        const fatherId = (await src_1.Mock(DeepPerson_1.default).generate(1, {
            age: 61,
            group: "test"
        })).pop();
        await person.addToRelationship("parents", [
            motherId.compositeKey,
            fatherId.compositeKey
        ]);
    });
    it("addToRelationshipo works for M:M (FK has shared dynamic segment; using explicit composite key)", async () => {
        const motherId = (await src_1.Mock(DeepPerson_1.default).generate(1, {
            age: 55,
            group: "test"
        })).pop();
        const fatherId = (await src_1.Mock(DeepPerson_1.default).generate(1, {
            age: 61,
            group: "test"
        })).pop();
        let mother = await src_1.Record.get(DeepPerson_1.default, {
            id: motherId.id,
            group: "test"
        });
        let father = await src_1.Record.get(DeepPerson_1.default, {
            id: fatherId.id,
            group: "test"
        });
        // add reln
        await person.addToRelationship("parents", [
            mother.compositeKey,
            father.compositeKey
        ]);
        // refresh records
        person = await src_1.Record.get(DeepPerson_1.default, `${person.id}::group:test`);
        mother = await src_1.Record.get(DeepPerson_1.default, mother.compositeKey);
        father = await src_1.Record.get(DeepPerson_1.default, father.compositeKey);
        // test
        expect(person.data.parents).to.haveOwnProperty(mother.compositeKeyRef);
        expect(person.data.parents).to.haveOwnProperty(father.compositeKeyRef);
        expect(mother.data.children).to.haveOwnProperty(person.compositeKeyRef);
        expect(father.data.children).to.haveOwnProperty(person.compositeKeyRef);
    });
    it("addToRelationshipo works for M:M (FK has different dynamic segment; using explicit composite key)", async () => {
        const motherId = (await src_1.Mock(DeepPerson_1.default).generate(1, {
            age: 55,
            group: "test"
        })).pop();
        const fatherId = (await src_1.Mock(DeepPerson_1.default).generate(1, {
            age: 61,
            group: "test"
        })).pop();
        let mother = await src_1.Record.get(DeepPerson_1.default, `${motherId.id}::group:test2`);
        let father = await src_1.Record.get(DeepPerson_1.default, `${fatherId.id}::group:test2`);
        // add reln
        await person.addToRelationship("parents", [
            mother.compositeKey,
            father.compositeKey
        ]);
        // refresh records
        person = await src_1.Record.get(DeepPerson_1.default, `${person.id}::group:test`);
        mother = await src_1.Record.get(DeepPerson_1.default, mother.compositeKey);
        father = await src_1.Record.get(DeepPerson_1.default, father.compositeKey);
        // test
        expect(person.data.parents).to.haveOwnProperty(mother.compositeKeyRef);
        expect(person.data.parents).to.haveOwnProperty(father.compositeKeyRef);
        expect(mother.data.children).to.haveOwnProperty(person.compositeKeyRef);
        expect(father.data.children).to.haveOwnProperty(person.compositeKeyRef);
    });
    it("setRelationship works for 1:M (where FK is on same dynamic path)", async () => {
        let company = await src_1.Record.add(Company_1.default, {
            name: "acme",
            state: "CA",
            group: "test",
            employees: {}
        });
        person.setRelationship("employer", company.compositeKeyRef);
        company = await src_1.Record.get(Company_1.default, company.compositeKey);
        person = await src_1.Record.get(DeepPerson_1.default, person.compositeKey);
        expect(person.data.employer).to.equal(company.compositeKeyRef);
        expect(company.data.employees).to.haveOwnProperty(person.compositeKeyRef);
    });
    it("setRelationship works for 1:M (where FK is on different dynamic path)", async () => {
        let company = await src_1.Record.add(Company_1.default, {
            name: "acme",
            state: "CA",
            group: "test2",
            employees: {}
        });
        person.setRelationship("employer", company.compositeKeyRef);
        company = await src_1.Record.get(Company_1.default, company.compositeKeyRef);
        person = await src_1.Record.get(DeepPerson_1.default, person.compositeKeyRef);
        expect(person.data.employer).to.equal(company.compositeKeyRef);
        expect(company.data.employees).to.haveOwnProperty(person.compositeKeyRef);
    });
    it("setRelationship works for 1:M (where FK is not on a dynamic path)", async () => {
        let attribute = await src_1.Record.add(HumanAttribute_1.HumanAttribute, {
            attribute: "smart",
            category: "abc"
        });
        person.addToRelationship("attributes", attribute.compositeKeyRef);
        attribute = await src_1.Record.get(HumanAttribute_1.HumanAttribute, attribute.compositeKeyRef);
        person = await src_1.Record.get(DeepPerson_1.default, person.compositeKey);
        expect(person.data.attributes).to.haveOwnProperty(attribute.compositeKeyRef);
    });
});
describe("LIST uses static offsets() with static API methods", () => {
    let db;
    before(async () => {
        db = await abstracted_admin_1.DB.connect({ mocking: true });
        src_1.FireModel.defaultDb = db;
        db.mock.updateDB({});
    });
    it.skip("LIST.offsets() returns LIST API", async () => {
        // const api = List.offsets({ geoCode: "1234" });
        // expect(List).to.have.ownProperty("all");
        // expect(List).to.have.ownProperty("where");
    });
    it("List.all works with offsets", async () => {
        await src_1.Mock(DeepPerson_1.default).generate(3, { group: "test" });
        await src_1.Mock(DeepPerson_1.default).generate(5, { group: "test2" });
        await src_1.Mock(DeepPerson_1.default).generate(5, { group: "test3" });
        const people = await src_1.List.all(DeepPerson_1.default, { offsets: { group: "test" } });
        expect(people.length).to.equal(3);
    });
    it("List.where works with offsets", async () => {
        await src_1.Mock(DeepPerson_1.default).generate(3, { group: "test", age: 32 });
        await src_1.Mock(DeepPerson_1.default).generate(6, { group: "test", age: 45 });
        await src_1.Mock(DeepPerson_1.default).generate(5, { group: "test2", age: 45 });
        const people = await src_1.List.where(DeepPerson_1.default, "age", 45, {
            offsets: { group: "test" }
        });
        expect(people.length).to.equal(6);
        expect(people.filter(i => i.age === 45)).is.length(6);
    });
});
describe("MOCK uses dynamic dbOffsets", () => {
    let db;
    beforeEach(async () => {
        db = await abstracted_admin_1.DB.connect({ mocking: true });
        src_1.FireModel.defaultDb = db;
    });
    it("Mock() by default does not build out relationships", async () => {
        const results = await src_1.Mock(DeepPerson_1.default).generate(2, { group: "test" });
        const first = helpers_1.firstRecord(db.mock.db.group.test.testing.deepPeople);
        const last = helpers_1.lastRecord(db.mock.db.group.test.testing.deepPeople);
        expect(first.hobbies).is.an("object");
        expect(Object.keys(first.hobbies)).to.have.lengthOf(0);
        expect(last.hobbies).is.an("object");
        expect(Object.keys(last.hobbies)).to.have.lengthOf(0);
    });
    it("Mock() with 'createRelationshipLinks' adds fks but records it points does not exist", async () => {
        const results = await src_1.Mock(DeepPerson_1.default)
            .createRelationshipLinks()
            .generate(2, { group: "test" });
        const first = helpers_1.firstRecord(db.mock.db.group.test.testing.deepPeople);
        const last = helpers_1.lastRecord(db.mock.db.group.test.testing.deepPeople);
        expect(first.hobbies).is.an("object");
        expect(Object.keys(first.hobbies)).to.have.lengthOf(2);
        expect(last.hobbies).is.an("object");
        expect(Object.keys(last.hobbies)).to.have.lengthOf(2);
    });
    it("Mock() generates mocks on dynamic path", async () => {
        await src_1.Mock(DeepPerson_1.default)
            .followRelationshipLinks()
            .generate(2, { group: "test" });
        expect(db.mock.db.group.test.testing.deepPeople).is.an("object");
        expect(db.mock.db.hobbies).is.an("object");
        expect(db.mock.db.attributes).is.an("object");
        const attributeKey = helpers_1.firstKey(db.mock.db.attributes);
        const attributes = db.mock.db.attributes[attributeKey].humanAttributes;
        const firstAttribute = attributes[helpers_1.firstKey(attributes)];
        expect(firstAttribute).to.have.ownProperty("attribute");
        expect(db.mock.db.test.testing.companies).is.an("object");
    });
    it("Mock() mocks on dynamic path without relationships rendered", async () => {
        await src_1.Mock(DeepPerson_1.default).generate(2, { group: "test" });
        expect(helpers_1.firstRecord(db.mock.db.group.test.testing.deepPeople).age).to.be.a("number");
        fkStructuralChecksForHasMany(db.mock.db.group.test.testing.deepPeople);
    });
    it("Mock() mocks on dynamic path and creates appropriate FK with using createRelationshipLinks()", async () => {
        await src_1.Mock(DeepPerson_1.default)
            .createRelationshipLinks()
            .generate(2, { group: "test" });
        fkStructuralChecksForHasMany(db.mock.db.group.test.testing.deepPeople);
    });
    it("Mock() mocks on dynamic path and creates appropriate FK bi-directionally with using followRelationshipLinks()", async () => {
        await src_1.Mock(DeepPerson_1.default)
            .followRelationshipLinks()
            .generate(2, { group: "test" });
        // basics
        expect(db.mock.db.group.test.testing.deepPeople).is.an("object");
        expect(db.mock.db.hobbies).is.an("object");
        expect(db.mock.db.test.testing.companies).is.an("object");
        // FK checks
        fkStructuralChecksForHasMany(db.mock.db.group.test.testing.deepPeople);
        fkPropertyStructureForHasMany(db.mock.db.group.test.testing.deepPeople, ["parents", "children", "practitioners"], true);
        fkPropertyStructureForHasMany(db.mock.db.group.test.testing.deepPeople, ["hobby"], false);
        fkPropertyStructureForHasOne(db.mock.db.group.test.testing.deepPeople, ["employer"], true);
        fkPropertyStructureForHasOne(db.mock.db.group.test.testing.deepPeople, ["school"], false);
    });
    it("Mock() throws an error if dynamic props aren't set", async () => {
        try {
            await src_1.Mock(DeeperPerson_1.DeeperPerson).generate(3);
            throw new Error("Should have failed");
        }
        catch (e) {
            expect(e.code).to.equal("mock-not-ready");
        }
    });
});
describe("WATCHers work with dynamic dbOffsets", () => {
    beforeEach(async () => {
        src_1.FireModel.defaultDb = await abstracted_admin_1.DB.connect({ mocking: true });
    });
    afterEach(async () => {
        src_1.FireModel.defaultDb.remove("/group", true);
    });
    it("Watching a RECORD with a dbOffset works", async () => {
        const events = [];
        const dispatch = (evt) => {
            events.push(evt);
        };
        src_1.FireModel.dispatch = dispatch;
        const watchRecord = await src_1.Watch.record(DeepPerson_1.default, {
            id: "12345",
            group: "CA"
        });
        expect(watchRecord.start).to.be.a("function");
        expect(watchRecord.dispatch).to.be.a("function");
        const watcher = await watchRecord.start();
        expect(watcher).to.haveOwnProperty("watcherId");
        expect(watcher.watcherSource).to.equal("record");
        expect(watcher.eventType).to.equal("value");
        expect(watcher.dbPath).to.equal("/group/CA/testing/deepPeople/12345");
        const person = await src_1.Record.add(DeepPerson_1.default, {
            id: "12345",
            group: "CA",
            age: 23,
            name: { first: "Charlie", last: "Chaplin" }
        });
        expect(events.map(i => i.type)).to.include(src_1.FmEvents.RECORD_ADDED_CONFIRMATION);
    });
    it("Watching a LIST with a dbOffset works", async () => {
        const events = [];
        const dispatch = (evt) => {
            events.push(evt);
        };
        src_1.FireModel.dispatch = dispatch;
        const watchList = src_1.Watch.list(DeepPerson_1.default).offsets({ group: "CA" });
        expect(watchList.start).to.be.a("function");
        expect(watchList.all).to.be.a("function");
        expect(watchList.where).to.be.a("function");
        expect(watchList.since).to.be.a("function");
        expect(watchList.recent).to.be.a("function");
        expect(watchList.before).to.be.a("function");
        expect(watchList.after).to.be.a("function");
        const watcher = await watchList.all().start();
        expect(watcher)
            .to.haveOwnProperty("watcherId")
            .and.to.be.a("string");
        await src_1.Record.add(DeepPerson_1.default, {
            name: { first: "Robert", last: "Kennedy" },
            age: 55,
            group: "CA"
        });
        expect(events.map(i => i.type)).to.include(src_1.FmEvents.RECORD_ADDED_CONFIRMATION);
    });
});
function fkStructuralChecksForHasMany(person) {
    expect(helpers_1.firstRecord(person).hobbies).is.an("object");
    expect(helpers_1.firstRecord(person).parents).is.an("object");
    expect(helpers_1.firstRecord(person).attributes).is.an("object");
}
function fkPropertyStructureForHasOne(record, props, withDynamicPath) {
    props.forEach(prop => {
        const firstFk = helpers_1.firstRecord(record)[prop];
        const lastFk = helpers_1.lastRecord(record)[prop];
        const fks = [firstFk, lastFk].filter(i => i);
        fks.forEach(fk => {
            expect(fk).to.be.a("string");
            if (withDynamicPath) {
                expect(fk).to.include("::");
            }
            else {
                expect(fk).to.not.include("::");
            }
        });
    });
}
function fkPropertyStructureForHasMany(record, props, withDynamicPath) {
    props.forEach(prop => {
        const firstFk = helpers_1.firstRecord(record)[prop];
        const lastFk = helpers_1.lastRecord(record)[prop];
        const fks = [firstFk, lastFk].filter(i => i).map(i => helpers_1.firstKey(i));
        fks.forEach(fk => {
            expect(fk).to.be.a("string");
            if (withDynamicPath) {
                expect(fk).to.include("::");
            }
            else {
                expect(fk).to.not.include("::");
            }
        });
    });
}
//# sourceMappingURL=dynamic-offset-spec.js.map