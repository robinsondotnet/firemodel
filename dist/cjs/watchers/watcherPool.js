"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typed_conversions_1 = require("typed-conversions");
/** a cache of all the watched  */
let watcherPool = {};
function getWatcherPool() {
    return watcherPool;
}
exports.getWatcherPool = getWatcherPool;
function getWatcherPoolList() {
    return typed_conversions_1.hashToArray(getWatcherPool());
}
exports.getWatcherPoolList = getWatcherPoolList;
function addToWatcherPool(item) {
    watcherPool[item.watcherId] = item;
}
exports.addToWatcherPool = addToWatcherPool;
function getFromWatcherPool(code) {
    return watcherPool[code];
}
exports.getFromWatcherPool = getFromWatcherPool;
function clearWatcherPool() {
    watcherPool = {};
}
exports.clearWatcherPool = clearWatcherPool;
/**
 * Each watcher must have it's own `dispatch()` function which
 * is reponsible for capturing the "context". This will be used
 * both by locally originated events (which have more info) and
 * server based events.
 */
function addDispatchForWatcher(code, dispatch) {
    //
}
exports.addDispatchForWatcher = addDispatchForWatcher;
function removeFromWatcherPool(code) {
    delete watcherPool[code];
    return watcherPool;
}
exports.removeFromWatcherPool = removeFromWatcherPool;
//# sourceMappingURL=watcherPool.js.map