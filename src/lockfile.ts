import type { RootPkgJson } from "./node";
import { lockfileVersion, LockfileJson } from "./genLock";

interface LockfileOptions {
  registry: string;
  legacyPeerDeps: boolean;
  json?: LockfileJson;
}

export class Lockfile {
  private json?: LockfileJson;

  constructor(private opts: LockfileOptions) {
    if (this.canUse()) {
      this.json = opts.json;
    }
  }

  private canUse() {
    const { json, registry, legacyPeerDeps } = this.opts;
    if (!json) return false;
    if (json.registry !== registry) return false;
    if (json.legacyPeerDeps !== legacyPeerDeps) return false;
    if (json.lockfileVersion !== lockfileVersion) return false;
    return true;
  }
}
