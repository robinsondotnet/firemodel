"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const ModelMeta_1 = require("../ModelMeta");
const mockValue_1 = __importDefault(require("./mockValue"));
/** adds mock values for all the properties on a given model */
function mockProperties(db, config = { relationshipBehavior: "ignore" }, exceptions) {
    return async (record) => {
        const meta = ModelMeta_1.getModelMeta(record);
        const props = meta.properties;
        const recProps = {};
        // below is needed to import faker library
        await db.mock.getMockHelper();
        props.map(prop => {
            const p = prop.property;
            recProps[p] = mockValue_1.default(db, prop);
        });
        const finalized = Object.assign({}, recProps, exceptions);
        // write to mock db and retain a reference to same model
        record = await __1.Record.add(record.modelConstructor, finalized, {
            silent: true
        });
        return record;
    };
}
exports.default = mockProperties;
//# sourceMappingURL=mockProperties.js.map