import { IDictionary, wait } from "common-types";
import { IWatcherEventContext } from "../state-mgmt/index";
import { Model } from "../Model";

/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized: IDictionary<boolean> = {};

export const hasInitialized = (watcherId?: string) => {
  if (watcherId) {
    _hasInitialized[watcherId] = true;
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
  timeout: number = 3000
): Promise<void> {
  setTimeout(() => {
    console.log(
      "hasInitialized (at point of timeout):",
      hasInitialized(),
      watcher.watcherId
    );

    if (!ready(watcher)) {
      throw new Error(
        `Timed out waiting for initialization of watcher "${watcher.watcherId}"`
      );
    }
  }, timeout);

  while (!ready(watcher)) {
    await wait(50);
  }
}

function ready<T>(watcher: IWatcherEventContext<T>) {
  return hasInitialized()[watcher.watcherId] ? true : false;
}
