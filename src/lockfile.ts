import type { Manager } from "./manager";
import type { Node, EdgeType } from "./node";

interface Deps {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  acceptDependencies?: Record<string, string>;
}

export interface LockfileData {
  lockfileVersion: string;
  registry: string;
  importers: Record<
    string,
    Deps & {
      specifiers?: Record<string, string>;
    }
  >;
  packages: Record<
    string,
    Deps & {
      version: string;
      resolved: string;
    }
  >;
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

      data.importers[name] = {};

      for (const key in targetNode.edges) {
        const { wanted, type, node } = targetNode.edges[key];
        const prop = this.getDepNameByEdgeType(type);

        if (!data.importers[name][prop]) {
          data.importers[name][prop] = {};
        }
        if (!data.importers[name].specifiers) {
          data.importers[name].specifiers = {};
        }
        data.importers[name].specifiers![node.name] = wanted;
        data.importers[name][prop]![node.name] = node.version;
      }
    }
  }

  private processPackageNodes(data: LockfileData) {
    for (const key in this.manager.modules) {
      for (const version in this.manager.modules[key]) {
        const node = this.manager.modules[key][version];
        const spec = `${node.name}@${node.version}`;

        data.packages[spec] = {
          version: node.version,
          resolved: node.resolved!,
        };

        for (const name in node.edges) {
          const edge = node.edges[name];
          const prop = this.getDepNameByEdgeType(edge.type);

          if (!data.packages[spec][prop]) {
            data.packages[spec][prop] = {};
          }
          data.packages[spec][prop]![edge.node.name] = edge.node.version;
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
