"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const reflector_1 = require("./reflector");
const typed_conversions_1 = require("typed-conversions");
/** DB Indexes accumlated by index decorators */
exports.indexesForModel = {};
/**
 * Gets all the db indexes for a given model
 */
function getDbIndexes(modelKlass) {
    const modelName = modelKlass.constructor.name;
    return modelName === "Model"
        ? typed_conversions_1.hashToArray(exports.indexesForModel[modelName])
        : (typed_conversions_1.hashToArray(exports.indexesForModel[modelName]) || []).concat(typed_conversions_1.hashToArray(exports.indexesForModel.Model));
}
exports.getDbIndexes = getDbIndexes;
exports.index = reflector_1.propertyReflector({
    isIndex: true,
    isUniqueIndex: false
}, exports.indexesForModel);
exports.uniqueIndex = reflector_1.propertyReflector({
    isIndex: true,
    isUniqueIndex: true
}, exports.indexesForModel);
//# sourceMappingURL=indexing.js.map