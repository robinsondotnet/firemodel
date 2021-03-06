import { WatchList } from "./WatchList";
import { WatchRecord } from "./WatchRecord";
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
export declare function getWatchList<T>(): WatchList<T>;
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
export declare function getWatchRecord<T>(): WatchRecord<T>;
