import mockProperties from "./mockProperties";
import addRelationships from "./addRelationships";
import { Record } from "../Record";
import { FireModelError } from "../errors";
let mockPrepared = false;
export default function API(db, modelConstructor) {
    const config = {
        relationshipBehavior: "ignore",
        exceptionPassthrough: false
    };
    const MockApi = {
        /**
         * generate
         *
         * Populates the mock database with values for a given model passed in.
         *
         * @param count how many instances of the given Model do you want?
         * @param exceptions do you want to fix a given set of properties to a static value?
         */
        async generate(count, exceptions = {}) {
            if (!mockPrepared) {
                const FireMock = (await import("firemock")).Mock;
                await FireMock.prepare();
                mockPrepared = true;
            }
            const props = mockProperties(db, config, exceptions);
            const relns = addRelationships(db, config, exceptions);
            // create record; using any incoming exception to build the object.
            // this is primarily to form the "composite key" where it is needed
            const record = Record.createWith(modelConstructor, exceptions);
            if (record.hasDynamicPath) {
                // which props -- required for compositeKey -- are not yet
                // set
                const notCovered = record.dynamicPathComponents.filter(key => !Object.keys(exceptions).includes(key));
                // for now we are stating that these two mock-types can
                // be used to dig us out of this deficit; we should
                // consider openning this up
                // TODO: consider opening up other mockTypes to fill in the compositeKey
                const validMocks = ["sequence", "random", "distribution"];
                notCovered.forEach(key => {
                    const prop = record.META.property(key) || {};
                    const mock = prop.mockType;
                    if (!mock ||
                        (typeof mock !== "function" && !validMocks.includes(mock))) {
                        throw new FireModelError(`The mock for the "${record.modelName}" model has dynamic segments and "${key}" was neither set as a fixed value in the exception parameter [ ${Object.keys(exceptions || {})} ] of generate() nor was the model constrained by a @mock type ${mock ? `[ ${mock} ]` : ""} which is deemed valid. Valid named mocks are ${JSON.stringify(validMocks)}; all bespoke mocks are accepted as valid.`, `firemodel/mock-not-ready`);
                    }
                });
            }
            let mocks = [];
            for (const i of Array(count)) {
                mocks = mocks.concat(await relns(await props(record)));
            }
            return mocks;
        },
        /**
         * createRelationshipLinks
         *
         * Creates FK links for all the relationships in the model you are generating.
         *
         * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
         */
        createRelationshipLinks(cardinality) {
            config.relationshipBehavior = "link";
            return MockApi;
        },
        /**
         * Allows variation in how dynamic paths are configured on FK relationships
         */
        dynamicPathBehavior(options) {
            //
            return MockApi;
        },
        /** All overrides for the primary model are passed along to FK's as well */
        overridesPassThrough() {
            config.exceptionPassthrough = true;
            return MockApi;
        },
        /**
         * followRelationshipLinks
         *
         * Creates FK links for all the relationships in the model you are generating; also generates
         * mocks for all the FK links.
         *
         * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
         */
        followRelationshipLinks(cardinality) {
            // TODO: would like to move back to ICardinalityConfig<T> when I can figure out why Partial doesn't work
            config.relationshipBehavior = "follow";
            if (cardinality) {
                config.cardinality = cardinality;
            }
            return MockApi;
        }
    };
    return MockApi;
}
//# sourceMappingURL=api.js.map