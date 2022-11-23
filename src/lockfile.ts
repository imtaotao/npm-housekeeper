import { lockfileVersion, LockfileJson } from "./genLock";

export class Lockfile {
  private data?: LockfileJson;

  constructor(data?: LockfileJson) {
    if (data && data.lockfileVersion === lockfileVersion) {
      this.data = data;
    }
  }
}
