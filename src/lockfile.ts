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
}

export interface LockfileJson {
  lockfileVersion: string;
  importers: Record<string, ImporterValue>;
  packages: Record<string, Record<string, PackageValue>>;
}

interface LockfileOptions {
  json?: LockfileJson | string;
  rootNodeGetter: () => Node;
}

export class Lockfile {
  public version = "1";
  private json?: LockfileJson;
  private rootNodeGetter: () => Node;

  constructor(opts: LockfileOptions) {
    this.rootNodeGetter = opts.rootNodeGetter;
    // prettier-ignore
    const json = typeof opts.json === "string"
      ? JSON.parse(opts.json)
      : opts.json;
    if (this.canUse(json)) {
      this.json = json;
    }
  }

  private canUse(json: LockfileJson) {
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
    for (const key in targetNode.edges) {
      const { node, type, name, wanted } = targetNode.edges[key];
      const prop = getDepPropByEdgeType(type, false);

      // Record the `wanted` of the project dependency
      if (isImport) {
        if (!(obj as ImporterValue).specifiers) {
          (obj as ImporterValue).specifiers = Object.create(null);
        }
        (obj as ImporterValue).specifiers![name] = wanted;
      }

      if (prop === "peerDependenciesMeta") {
        // Add to `peerDependencies`
        let peerDeps = obj["peerDependencies"];
        if (!peerDeps) peerDeps = obj["peerDependencies"] = Object.create(null);
        if (!peerDeps![name]) peerDeps![name] = node ? node.version : wanted;
        // Record `meta`
        let peerMeta = obj[prop];
        if (!peerMeta) peerMeta = obj[prop] = Object.create(null);
        if (!peerMeta![name]) peerMeta![name] = Object.create(null);
        peerMeta![name].optional = true;
      } else {
        if (!obj[prop]) obj[prop] = Object.create(null);
        // If filtered, there may be no node
        obj[prop]![name] = node ? node.version : wanted;
      }
    }
  }

  private processTopNode(targetNode: Node, json: LockfileJson) {
    if (targetNode.hasError()) {
      targetNode.logErrors();
      return true;
    }
    const importerValue = (json.importers[targetNode.name] =
      Object.create(null));
    this.recordDeps(targetNode, importerValue, true);
    return false;
  }

  private processPackageNodes(manager: Manager, json: LockfileJson) {
    let error = false;
    manager.each((name, version, targetNode) => {
      if (targetNode.hasError()) {
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
      this.recordDeps(targetNode, packageValue, false);
    });
    return error;
  }

  output() {
    const rootNode = this.rootNodeGetter();
    const { manager } = rootNode;
    const json: LockfileJson = Object.create(null);

    json.lockfileVersion = this.version;
    json.importers = Object.create(null);
    json.packages = Object.create(null);

    // If there is an error, the lockfile cannot be generated
    if (this.processTopNode(rootNode, json)) return null;
    if (rootNode.workspace) {
      for (const key in rootNode.workspace) {
        if (this.processTopNode(rootNode.workspace[key], json)) {
          return null;
        }
      }
    }
    return this.processPackageNodes(manager, json) ? null : json;
  }

  // TODO: 对比 lockfile 发生的变化
  diff(newJson: LockfileJson, oldJson = this.json) {
    if (!oldJson) {
      oldJson = {
        packages: {},
        importers: {},
        lockfileVersion: this.version,
      };
    }
    // ...
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
}
