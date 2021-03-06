import { IDictionary, wait } from "common-types";
import { IWatcherEventContext } from "../state-mgmt/index";
import { Model } from "../Model";

/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized: IDictionary<boolean | "timed-out"> = {};

export const hasInitialized = (
  watcherId?: string,
  value: true | "timed-out" = true
) => {
  if (watcherId) {
    _hasInitialized[watcherId] = value;
  }

  return _hasInitialized;
};

/**
 * Waits for a newly started watcher to get back the first
 * data from the watcher. This indicates that the frontend
 * and Firebase DB are now in sync.
 */
export async function waitForInitialization<T = Model>(
  watcher: IWatcherEventContext<T>,
  timeout: number = 750
): Promise<void> {
  setTimeout(() => {
    if (!ready(watcher)) {
      console.info(
        `A watcher [ ${
          watcher.watcherId
        } ] has not returned an event in the timeout window  [ ${timeout}ms ]. This might represent an issue but can also happen when a watcher starts listening to a path [ ${watcher.watcherPaths.join(
          ", "
        )} ] which has no data yet.`
      );
    }
    hasInitialized(watcher.watcherId, "timed-out");
  }, timeout);

  while (!ready(watcher)) {
    await wait(50);
  }
}

function ready<T>(watcher: IWatcherEventContext<T>) {
  return hasInitialized()[watcher.watcherId] ? true : false;
}
