"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const get_value_1 = __importDefault(require("get-value"));
const set_value_1 = __importDefault(require("set-value"));
const property_store_1 = require("./model-meta/property-store");
const relationship_store_1 = require("./model-meta/relationship-store");
function push(target, path, value) {
    if (Array.isArray(get_value_1.default(target, path))) {
        get_value_1.default(target, path).push(value);
    }
    else {
        set_value_1.default(target, path, [value]);
    }
}
exports.propertyDecorator = (nameValuePairs = {}, 
/**
 * if you want to set the property being decorated's name
 * as property on meta specify the meta properties name here
 */
property) => (target, key) => {
    const reflect = Reflect.getMetadata("design:type", target, key) || {};
    if (nameValuePairs.isProperty) {
        const meta = Object.assign(Object.assign(Object.assign({}, Reflect.getMetadata(key, target)), { type: reflect.name }), nameValuePairs);
        Reflect.defineMetadata(key, meta, target);
        property_store_1.addPropertyToModelMeta(target.constructor.name, property, meta);
    }
    if (nameValuePairs.isRelationship) {
        const meta = Object.assign(Object.assign(Object.assign({}, Reflect.getMetadata(key, target)), { type: reflect.name }), nameValuePairs);
        Reflect.defineMetadata(key, meta, target);
        relationship_store_1.addRelationshipToModelMeta(target.constructor.name, property, meta);
    }
};
/** lookup meta data for schema properties */
function propertyMeta(context) {
    return (prop) => Reflect.getMetadata(prop, context);
}
function getPushKeys(target) {
    const props = property_store_1.getProperties(target);
    return props.filter(p => p.pushKey).map(p => p.property);
}
exports.getPushKeys = getPushKeys;
//# sourceMappingURL=decorator.js.map