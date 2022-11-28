import * as semver from "esm-semver";
import { getDepPropByEdgeType } from "./utils";
import type { Manager } from "./manager";
import type { Node, EdgeType, NodeDeps } from "./node";

export interface ImporterValue extends NodeDeps {
  specifiers?: Record<string, string>;
}

export interface PackageValue extends NodeDeps {
  resolved: string;
  integrity: string;
  hasBin?: boolean;
}

export type Packages = Record<string, Record<string, PackageValue>>;

export interface LockfileJson {
  lockfileVersion: string;
  importers: Record<string, ImporterValue>;
  packages: Packages;
}

interface LockfileOptions {
  managerGetter: () => Manager;
  json?: LockfileJson | string;
}

export class Lockfile {
  public version = "1";
  public json?: LockfileJson;
  private managerGetter: () => Manager;

  constructor(opts: LockfileOptions) {
    this.managerGetter = opts.managerGetter;
    this.set(opts.json);
  }

  private canUse(json?: LockfileJson) {
    if (!json || typeof json !== "object") return false;
    if (json.lockfileVersion !== this.version) return false;
    for (const p of ["importers", "packages"] as const) {
      if (!json[p] || typeof json[p] !== "object") return false;
    }
    return true;
  }

  private recordDeps(
    targetNode: Node,
    obj: ImporterValue | PackageValue,
    isImport: boolean
  ) {
    const missEdges = new Set<string>();

    for (const key in targetNode.edges) {
      const { ws, node, type, name, wanted } = targetNode.edges[key];
      // A dependency specified by `workspace:x` that does not need to be documented in the lock file.
      // When a package is released in workspace, we assume they have handled the dependent version themselves
      // Perhaps we can provide the api to do it for them.
      if (ws) continue;

      // Record the `wanted` of the project dependency
      if (isImport) {
        let specifiers = (obj as ImporterValue).specifiers;
        if (!specifiers) {
          specifiers = (obj as ImporterValue).specifiers = Object.create(null);
        }
        specifiers![name] = wanted;
      }

      const set = (deps: Exclude<NodeDeps[keyof NodeDeps], undefined>) => {
        if (node) {
          deps[name] = node.version;
        } else {
          // If filtered, there may be no node
          deps[name] = wanted;
          missEdges.add(name);
        }
      };

      const prop = getDepPropByEdgeType(type, false);

      if (prop === "peerDependenciesMeta") {
        // Add to `peerDependencies`
        let peerDeps = obj["peerDependencies"];
        if (!peerDeps) peerDeps = obj["peerDependencies"] = Object.create(null);
        if (!peerDeps![name]) set(peerDeps!);
        // Record `meta`info
        let peerMeta = obj[prop];
        if (!peerMeta) peerMeta = obj[prop] = Object.create(null);
        if (!peerMeta![name]) peerMeta![name] = Object.create(null);
        peerMeta![name].optional = true;
      } else {
        if (!obj[prop]) obj[prop] = Object.create(null);
        set(obj[prop]!);
      }
    }

    const ad = targetNode.pkg.acceptDependencies;
    if (ad && missEdges.size > 0) {
      for (const edgeName of missEdges) {
        const accept = ad[edgeName];
        if (accept !== undefined) {
          if (!obj["acceptDependencies"]) {
            obj["acceptDependencies"] = Object.create(null);
          }
          obj["acceptDependencies"]![edgeName] = accept;
        }
      }
    }
  }

  private processWorkspaceNode(targetNode: Node, json: LockfileJson) {
    if (targetNode.hasError()) {
      console.error('Cannot output "lockData" when an error occurs');
      targetNode.logErrors();
      return true;
    } else {
      const importerValue = (json.importers[targetNode.name] =
        Object.create(null));
      this.recordDeps(targetNode, importerValue, true);
      return false;
    }
  }

  private processPackageNodes(manager: Manager, json: LockfileJson) {
    let error = false;
    manager.each((name, version, targetNode) => {
      if (targetNode.hasError()) {
        console.error('Cannot output "lockData" when an error occurs');
        targetNode.logErrors();
        error = true;
        return false;
      }
      let pkgVersions = json.packages[name];
      if (!pkgVersions) {
        pkgVersions = json.packages[name] = Object.create(null);
      }
      let packageValue = pkgVersions[version];
      if (!packageValue) {
        packageValue = pkgVersions[version] = Object.create(null);
      }

      // Save download address and message summary
      packageValue.resolved = targetNode.resolved;
      packageValue.integrity = targetNode.integrity;
      if (targetNode.hasBin) {
        packageValue.hasBin = targetNode.hasBin;
      }
      this.recordDeps(targetNode, packageValue, false);
    });
    return error;
  }

  tryGetNodeManifest(name: string, version: string) {
    if (!this.json) return null;
    if (!this.json.packages[name]) return null;
    const data = this.json.packages[name][version];
    if (!data) return null;
    return { name, version, ...data };
  }

  tryGetEdgeVersion(
    pname: string,
    name: string,
    wanted: string,
    edgeType: EdgeType
  ) {
    if (!this.json) return null;
    const lockInfo = this.json.importers[pname];
    if (!lockInfo || !lockInfo.specifiers) return null;
    const oldWanted = lockInfo.specifiers[name];

    if (oldWanted) {
      try {
        if (oldWanted === wanted || semver.eq(oldWanted, wanted)) {
          // If the new dependencies are in pkgJson `dependencies`,
          // and the old ones are in lockfile `DevDependencies`,
          // the current algorithm is not to match
          const lockDep = lockInfo[getDepPropByEdgeType(edgeType, true)];
          if (!lockDep) return null;
          return (lockDep[name] as string) || null;
        }
      } catch (e) {
        // `semver` version comparison may report an error
        return null;
      }
    }
    return null;
  }

  set(json?: LockfileJson | string) {
    if (typeof json === "string") {
      json = JSON.parse(json) as LockfileJson;
    }
    if (this.canUse(json)) {
      this.json = json;
      return true;
    }
    return false;
  }

  output() {
    const manager = this.managerGetter();
    const json: LockfileJson = Object.create(null);
    json.lockfileVersion = this.version;
    json.importers = Object.create(null);
    json.packages = Object.create(null);
    // If there is an error, the lockfile cannot be generated
    if (this.processPackageNodes(manager, json)) return null;
    for (const [_n, node] of Object.entries(manager.workspace)) {
      if (this.processWorkspaceNode(node, json)) return null;
    }
    return json;
  }

  // Get the packages that need to be added or deleted
  diff(newJson: LockfileJson, oldJson = this.json) {
    const mark = Object.create(null);
    // prettier-ignore
    const oldPackages = oldJson && this.canUse(oldJson)
      ? oldJson.packages
      : Object.create(null);

    const traverse = (lp: Packages, rp: Packages) => {
      const set: Packages = Object.create(null);
      for (const name in lp) {
        if (lp[name]) {
          for (const version in lp[name]) {
            const spec = `${name}@${version}`;
            if (mark[spec]) continue;
            mark[spec] = true;
            if (!rp[name] || !rp[name][version]) {
              if (!set[name]) set[name] = Object.create(null);
              set[name][version] = lp[name][version];
            }
          }
        }
      }
      return set;
    };

    return {
      add: traverse(newJson.packages, oldPackages),
      remove: traverse(oldPackages, newJson.packages),
    };
  }
}
