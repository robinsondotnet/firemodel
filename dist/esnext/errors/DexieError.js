/**
 * An error deriving from the **Dexie** integration with **Firemodel**.
 * Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
export class DexieError extends Error {
    constructor(message, classification = "firemodel/dexie") {
        super(message);
        this.firemodel = true;
        const parts = classification.split("/");
        const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}
//# sourceMappingURL=DexieError.js.map