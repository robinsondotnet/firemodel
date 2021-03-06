import { FireModelError } from "../errors";
import { capitalize } from "../util";
/**
 * Given a `Record` which defines all properties in it's
 * "dynamic segments" as well as an `id`; this function returns
 * an object representation of the composite key.
 */
export function createCompositeKey(rec) {
    const model = rec.data;
    if (!rec.id) {
        throw new FireModelError(`You can not create a composite key without first setting the 'id' property!`, "firemodel/not-ready");
    }
    const dynamicPathComponents = rec.dynamicPathComponents.reduce((prev, key) => {
        if (!model[key]) {
            throw new FireModelError(`You can not create a composite key on a ${capitalize(rec.modelName)} without first setting the '${key}' property!`, "firemodel/not-ready");
        }
        return Object.assign(Object.assign({}, prev), { [key]: model[key] });
    }, {});
    return rec.dynamicPathComponents.reduce((prev, key) => (Object.assign(Object.assign({}, prev), dynamicPathComponents)), { id: rec.id });
}
//# sourceMappingURL=createCompositeKey.js.map