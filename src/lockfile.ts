import * as semver from "esm-semver";
import { getDepPropByEdgeType } from "./utils";
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
  lockfileVersion: string;
  importers: Record<string, ImporterValue>;
  packages: Record<string, Record<string, PackageValue>>;
}

interface LockfileOptions {
  registry: string;
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
    if (this.canUse(json, opts.registry)) {
      this.json = json;
    }
  }

  private canUse(json: LockfileJson, registry: string) {
    if (!json || typeof json !== "object") return false;
    if (json.registry !== registry) return false;
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

      if (prop === "peerDependenciesMeta") {
        // 添加到 peerDependencies 中
        let peerDeps = obj["peerDependencies"];
        if (!peerDeps) peerDeps = obj["peerDependencies"] = Object.create(null);
        if (!peerDeps![name]) peerDeps![name] = node.version;
        // 记录 meta 信息
        let peerMeta = obj[prop];
        if (!peerMeta) peerMeta = obj[prop] = Object.create(null);
        if (!peerMeta![name]) peerMeta![name] = Object.create(null);
        peerMeta![name].optional = true;
      } else {
        if (!obj[prop]) obj[prop] = Object.create(null);
        obj[prop]![name] = node.version;
      }

      // 记录项目依赖的 wanted
      if (isImport) {
        if (!(obj as ImporterValue).specifiers) {
          (obj as ImporterValue).specifiers = Object.create(null);
        }
        (obj as ImporterValue).specifiers![name] = wanted;
      }
    }
  }

  private processTopNode(targetNode: Node, json: LockfileJson) {
    if (targetNode.isTop()) {
      const importerValue = (json.importers[targetNode.name] =
        Object.create(null));
      this.recordDeps(targetNode, importerValue, true);
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
      this.recordDeps(targetNode, packageValue, false);
    });
  }

  output() {
    const rootNode = this.rootNodeGetter();
    const { manager } = rootNode;
    const json: LockfileJson = Object.create(null);

    json.lockfileVersion = this.version;
    json.registry = manager.opts.registry;
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

  // TODO: 对比 lockfile 发生的变化
  diff(oldJson: LockfileJson, newJson: LockfileJson) {
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
          const lockDep = lockInfo[getDepPropByEdgeType(edgeType, true)];
          // 如果新的包在 dependencies 中, 而 lock 文件中在 DevDependencies 中，现在的算法是不要匹配上
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
