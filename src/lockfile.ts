import * as semver from "esm-semver";
import { lockfileVersion, LockfileJson } from "./genLock";
import { getDepNameByEdgeType } from "./utils";
import type { EdgeType, RootPkgJson, ProjectPkgJson } from "./node";

interface LockfileOptions {
  registry: string;
  legacyPeerDeps: boolean;
  json?: LockfileJson | string;
}

export class Lockfile {
  private json?: LockfileJson;

  constructor(opts: LockfileOptions) {
    // prettier-ignore
    const json = typeof opts.json === "string"
      ? JSON.parse(opts.json)
      : opts.json;
    if (this.canUse(json, opts.registry, opts.legacyPeerDeps)) {
      this.json = json;
    }
  }

  private canUse(
    json: LockfileJson,
    registry: string,
    legacyPeerDeps: boolean
  ) {
    if (!json || typeof json !== "object") return false;
    for (const p of [
      "registry",
      "importers",
      "packages",
      "legacyPeerDeps",
      "lockfileVersion",
    ]) {
      if (!(p in json)) return false;
    }
    if (json.registry !== registry) return false;
    if (json.legacyPeerDeps !== legacyPeerDeps) return false;
    if (json.lockfileVersion !== lockfileVersion) return false;
    return true;
  }

  tryGetNodeManifest(name: string, version: string) {
    if (!this.json) return null;
    if (!this.json.packages[name]) return null;
    const data = this.json.packages[name][version];
    if (!data) return null;
    return { name, version, ...data };
  }

  tryGetTopEdgeVersion(
    pname: string,
    name: string,
    wanted: string,
    type: EdgeType
  ) {
    if (!this.json) return null;
    const lockInfo = this.json.importers[pname];
    if (!lockInfo || !lockInfo.specifiers) return null;
    const oldWanted = lockInfo.specifiers[name];

    if (oldWanted) {
      try {
        if (oldWanted === wanted || semver.eq(oldWanted, wanted)) {
          const lockDep = lockInfo[getDepNameByEdgeType(type, true)];
          // 如果新的包在 dependencies, 而 lock 文件中在 DevDependencies 中，现在的算法是不匹配
          if (!lockDep) return null;
          return (lockDep[name] as string) || null;
        }
      } catch (e) {
        // console.warn(
        //   `Warning(${pname}.${getDepNameByEdgeType(type, true)}.${name}): ` +
        //     `lockVersion "${oldWanted}", currentVersion "${wanted}"`
        // );
        // console.warn(e);
        return null;
      }
    }
    return null;
  }
}
