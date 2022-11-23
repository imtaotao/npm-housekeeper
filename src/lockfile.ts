import type { RootPackageJson } from "./index";
import { lockfileVersion, LockfileJson } from "./genLock";

interface LockfileOptions {
  registry: string;
  pkgJson: RootPackageJson;
  data?: LockfileJson;
}

export class Lockfile {
  private data?: LockfileJson;

  constructor(private opts: LockfileOptions) {
    if (this.canUse()) {
      this.data = opts.data;
    }
  }

  private canUse() {
    const { data, registry, pkgJson } = this.opts;
    if (!data) return false;
    if (data.registry !== registry) return false;
    if (data.lockfileVersion !== lockfileVersion) return false;
    // ...
    return true;
  }
}
