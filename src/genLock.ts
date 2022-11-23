import { Node, EdgeType } from "./node";

interface Deps {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  acceptDependencies?: Record<string, string>;
}

type ImporterValue = Deps & {
  specifiers?: Record<string, string>;
};

type PackageValue = Deps & {
  version: string;
  resolved: string;
};

export interface LockfileJson {
  registry: string;
  lockfileVersion: string;
  importers: Record<string, ImporterValue>;
  packages: Record<string, PackageValue>;
}

export const lockfileVersion = "1";

export function genLockfile(rootNode: Node) {
  let projectId = 1;
  const { manager } = rootNode;

  const data: LockfileJson = {
    lockfileVersion,
    registry: manager.opts.registry,
    importers: Object.create(null),
    packages: Object.create(null),
  };

  const getDepNameByEdgeType = (type: EdgeType) => {
    if (type === "prod") return "dependencies";
    if (type === "dev") return "devDependencies";
    if (type === "peer") return "peerDependencies";
    if (type === "optional" || type === "peerOptional") {
      return "optionalDependencies";
    }
    return "dependencies";
  };

  const processPackageNodes = (data: LockfileJson) => {
    for (const pkgKey in manager.packages) {
      for (const version in manager.packages[pkgKey]) {
        const node = manager.packages[pkgKey][version];
        const spec = `${node.name}@${node.version}`;

        const packageValue: PackageValue = (data.packages[spec] = {
          version: node.version,
          resolved: node.resolved!,
        });

        for (const k in node.edges) {
          const edge = node.edges[k];
          const prop = getDepNameByEdgeType(edge.type);

          if (!packageValue[prop]) {
            packageValue[prop] = {};
          }
          packageValue[prop]![edge.name] = edge.node.version;
        }
      }
    }
  };

  const processTopNode = (data: LockfileJson, targetNode: Node) => {
    if (targetNode.isTop()) {
      let name = targetNode.name;
      if (!name) {
        name = targetNode.type === "root" ? "." : `project${projectId++}`;
      }
      const importerValue: ImporterValue = (data.importers[name] = {});

      for (const key in targetNode.edges) {
        const { wanted, type, node } = targetNode.edges[key];
        const prop = getDepNameByEdgeType(type);

        if (!importerValue.specifiers) {
          importerValue.specifiers = {};
        }
        if (!importerValue[prop]) {
          importerValue[prop] = {};
        }
        importerValue.specifiers![node.name] = wanted;
        importerValue[prop]![node.name] = node.version;
      }
    }
  };

  processPackageNodes(data);
  processTopNode(data, rootNode);
  for (const projectNode of rootNode.projects!) {
    processTopNode(data, projectNode);
  }

  return data;
}
