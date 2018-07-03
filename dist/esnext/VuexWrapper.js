/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
export function VeuxWrapper(vuexDispatch) {
    /** vuex wrapped redux dispatch function */
    return (reduxAction) => {
        const type = reduxAction.type;
        delete reduxAction.type;
        vuexDispatch(type, reduxAction);
    };
}
//# sourceMappingURL=VuexWrapper.js.map