import { FireModelError } from "./FireModelError";
export class DynamicPropertiesNotReady extends FireModelError {
    constructor(rec, message) {
        message = message
            ? message
            : `An attempt to interact with the record ${rec.modelName} in a way that requires that the fully composite key be specified. The required parameters for this model to be ready for this are: ${rec.dynamicPathComponents.join(", ")}.`;
        super(message, "firemodel/dynamic-properties-not-ready");
    }
}
//# sourceMappingURL=DynamicPropertiesNotReady.js.map