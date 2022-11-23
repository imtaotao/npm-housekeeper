import type { Manager } from "./manager";
import type { Node, EdgeType } from "./node";

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

export interface LockfileData {
  registry: string;
  lockfileVersion: string;
  importers: Record<string, ImporterValue>;
  packages: Record<string, PackageValue>;
}

export class Lockfile {
  private projectId = 1;

  constructor(private rootNode: Node, private manager: Manager) {}

  private getDepNameByEdgeType(type: EdgeType) {
    if (type === "prod") return "dependencies";
    if (type === "dev") return "devDependencies";
    if (type === "peer") return "peerDependencies";
    if (type === "optional" || type === "peerOptional") {
      return "optionalDependencies";
    }
    return "dependencies";
  }

  private processTopNode(data: LockfileData, targetNode: Node) {
    if (targetNode.isTop()) {
      let name = targetNode.name;
      if (!name) {
        name = targetNode.type === "root" ? "." : `project${this.projectId++}`;
      }
      const importerValue: ImporterValue = (data.importers[name] = {});

      for (const key in targetNode.edges) {
        const { wanted, type, node } = targetNode.edges[key];
        const prop = this.getDepNameByEdgeType(type);

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
  }

  private processPackageNodes(data: LockfileData) {
    for (const pkgKey in this.manager.packages) {
      for (const version in this.manager.packages[pkgKey]) {
        const node = this.manager.packages[pkgKey][version];
        const spec = `${node.name}@${node.version}`;

        const packageValue: PackageValue = (data.packages[spec] = {
          version: node.version,
          resolved: node.resolved!,
        });

        for (const k in node.edges) {
          const edge = node.edges[k];
          const prop = this.getDepNameByEdgeType(edge.type);

          if (!packageValue[prop]) {
            packageValue[prop] = {};
          }
          packageValue[prop]![edge.name] = edge.node.version;
        }
      }
    }
  }

  output() {
    const data = {
      lockfileVersion: "1",
      registry: this.manager.opts.registry,
      importers: Object.create(null),
      packages: Object.create(null),
    };

    this.processPackageNodes(data);
    this.processTopNode(data, this.rootNode);
    for (const projectNode of this.rootNode.projects!) {
      this.processTopNode(data, projectNode);
    }

    return data as LockfileData;
  }

  // 塞到 manager 中
  input(data: LockfileData) {
    // ...
  }
}
