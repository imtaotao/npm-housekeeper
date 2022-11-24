import { Manager } from "./manager";
import { Node, NodeDeps } from "./node";
import { getDepNameByEdgeType } from "./utils";

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

export const lockfileVersion = "1";

export function genLockfile(rootNode: Node) {
  const { manager } = rootNode;
  const json: LockfileJson = Object.create(null);

  json.lockfileVersion = lockfileVersion;
  json.registry = manager.opts.registry;
  json.legacyPeerDeps = rootNode.legacyPeerDeps;
  json.importers = Object.create(null);
  json.packages = Object.create(null);

  // 根目录的名字为 `.`
  processTopNode(rootNode, json);
  if (rootNode.projects) {
    for (const key in rootNode.projects) {
      processTopNode(rootNode.projects[key], json);
    }
  }
  processPackageNodes(manager, json);
  return json;
}

const processTopNode = (targetNode: Node, json: LockfileJson) => {
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
};

const processPackageNodes = (manager: Manager, json: LockfileJson) => {
  manager.each((name, version, targetNode) => {
    let pkgVersions = json.packages[name];
    if (!pkgVersions) {
      pkgVersions = json.packages[name] = Object.create(null);
    }
    let packageValue = pkgVersions[version];
    if (!packageValue) {
      packageValue = pkgVersions[version] = Object.create(null);
    }

    // 下载地址
    packageValue.resolved = targetNode.resolved;

    for (const key in targetNode.edges) {
      const { node, type, name } = targetNode.edges[key];
      const prop = getDepNameByEdgeType(type, false);
      // 依赖
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
};
