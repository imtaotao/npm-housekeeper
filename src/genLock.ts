import { Manager } from "./manager";
import { Node, EdgeType, NodeDeps, NodePkgJson } from "./node";

interface ImporterValue extends NodeDeps {
  specifiers?: Record<string, string>;
}

interface PackageValue extends NodeDeps {
  resolved: string;
}

export interface LockfileJson {
  registry: string;
  legacyPeerDeps: boolean;
  lockfileVersion: string;
  importers: Record<string, ImporterValue>;
  packages: Record<string, NodePkgJson>;
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
  processTopNode(".", rootNode, json);
  if (rootNode.projects) {
    for (const projectName in rootNode.projects) {
      processTopNode(projectName, rootNode.projects[projectName], json);
    }
  }
  processPackageNodes(manager, json);
  return json;
}

const getDepNameByEdgeType = (type: EdgeType) => {
  if (type === "prod") return "dependencies";
  if (type === "dev") return "devDependencies";
  if (type === "peer") return "peerDependencies";
  if (type === "optional") return "optionalDependencies";
  if (type === "peerOptional") return "peerDependenciesMeta";
  throw new TypeError(`Invalid edge type "${type}"`);
};

const processTopNode = (name: string, targetNode: Node, json: LockfileJson) => {
  if (targetNode.isTop()) {
    const importerValue = (json.importers[name] = Object.create(null));

    for (const key in targetNode.edges) {
      const { node, type, name, wanted } = targetNode.edges[key];
      const prop = getDepNameByEdgeType(type);
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
  for (const pkgKey in manager.packages) {
    for (const version in manager.packages[pkgKey]) {
      const targetNode = manager.packages[pkgKey][version];
      const spec = `${targetNode.name}@${targetNode.version}`;

      // 包的具体版本和下载地址
      const packageValue = (json.packages[spec] = Object.create(null));
      packageValue.name = targetNode.name;
      packageValue.version = targetNode.version;
      packageValue.resolved = targetNode.resolved;

      for (const key in targetNode.edges) {
        const { node, type, name } = targetNode.edges[key];
        const prop = getDepNameByEdgeType(type);
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
    }
  }
};
