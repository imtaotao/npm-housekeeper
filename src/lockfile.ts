import * as semver from "esm-semver";
import { getDepNameByEdgeType } from "./utils";
import type { Manager } from "./manager";
import type { Node, EdgeType, NodeDeps } from "./node";

export interface ImporterValue extends NodeDeps {
  specifiers?: Record<string, string>;
}

export interface PackageValue extends NodeDeps {
  resolved: string;
}

export interface LockfileJson {
  registry: string;
  legacyPeerDeps: boolean;
  lockfileVersion: string;
  importers: Record<string, ImporterValue>;
  packages: Record<string, Record<string, PackageValue>>;
}

interface LockfileOptions {
  registry: string;
  legacyPeerDeps: boolean;
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
    if (json.lockfileVersion !== this.version) return false;
    return true;
  }

  private processTopNode(targetNode: Node, json: LockfileJson) {
    if (targetNode.isTop()) {
      const importerValue = (json.importers[targetNode.name] =
        Object.create(null));

      for (const key in targetNode.edges) {
        const { node, type, name, wanted } = targetNode.edges[key];
        const prop = getDepNameByEdgeType(type, false);
        // 依赖
        if (prop === "peerDependenciesMeta") {
          let peerMeta = importerValue[prop];
          if (!peerMeta) peerMeta = importerValue[prop] = Object.create(null);
          if (!peerMeta![name]) peerMeta![name] = Object.create(null);
          peerMeta![name].optional = true;
        } else {
          if (!importerValue[prop]) importerValue[prop] = Object.create(null);
          importerValue[prop]![name] = node.version;
        }
        // 范围选择的依赖版本
        if (!importerValue.specifiers)
          importerValue.specifiers = Object.create(null);
        importerValue.specifiers![name] = wanted;
      }
    }
  }

  private processPackageNodes(manager: Manager, json: LockfileJson) {
    manager.each((name, version, targetNode) => {
      let pkgVersions = json.packages[name];
      if (!pkgVersions) {
        pkgVersions = json.packages[name] = Object.create(null);
      }
      let packageValue = pkgVersions[version];
      if (!packageValue) {
        packageValue = pkgVersions[version] = Object.create(null);
      }

      // 保存下载地址
      packageValue.resolved = targetNode.resolved;

      for (const key in targetNode.edges) {
        const { node, type, name } = targetNode.edges[key];
        const prop = getDepNameByEdgeType(type, false);
        // 保存依赖版本
        if (prop === "peerDependenciesMeta") {
          let peerMeta = packageValue[prop];
          if (!peerMeta) peerMeta = packageValue[prop] = Object.create(null);
          if (!peerMeta![name]) peerMeta![name] = Object.create(null);
          peerMeta![name].optional = true;
        } else {
          if (!packageValue[prop]) packageValue[prop] = Object.create(null);
          packageValue[prop]![name] = node.version;
        }
      }
    });
  }

  output() {
    const rootNode = this.rootNodeGetter();
    const { manager } = rootNode;
    const json: LockfileJson = Object.create(null);

    json.lockfileVersion = this.version;
    json.registry = manager.opts.registry;
    json.legacyPeerDeps = rootNode.legacyPeerDeps;
    json.importers = Object.create(null);
    json.packages = Object.create(null);

    // 根目录的名字为 `.`
    this.processTopNode(rootNode, json);
    if (rootNode.workspace) {
      for (const key in rootNode.workspace) {
        this.processTopNode(rootNode.workspace[key], json);
      }
    }
    this.processPackageNodes(manager, json);
    return json;
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
          const lockDep = lockInfo[getDepNameByEdgeType(edgeType, true)];
          // 如果新的包在 dependencies, 而 lock 文件中在 DevDependencies 中，现在的算法是不匹配
          if (!lockDep) return null;
          return (lockDep[name] as string) || null;
        }
      } catch (e) {
        // semver 版本比较可能报错
        return null;
      }
    }
    return null;
  }
}
