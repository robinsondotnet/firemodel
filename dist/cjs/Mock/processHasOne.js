"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mock_1 = require("../Mock");
async function processHasOne(source, rel, config, db) {
    const fkMock = Mock_1.Mock(rel.fkConstructor(), db);
    const fkMockMeta = (await fkMock.generate(1)).pop();
    const prop = rel.property;
    source.setRelationship(prop, fkMockMeta.compositeKey);
    if (config.relationshipBehavior === "link") {
        const predecessors = fkMockMeta.dbPath
            .replace(fkMockMeta.id, "")
            .split("/")
            .filter(i => i);
        await db.remove(fkMockMeta.dbPath);
    }
    return fkMockMeta;
}
exports.processHasOne = processHasOne;
//# sourceMappingURL=processHasOne.js.map