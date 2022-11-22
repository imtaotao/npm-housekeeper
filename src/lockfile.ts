import type { Node } from "./node";
import type { Manager } from "./manager";

interface Deps {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  acceptDependencies?: Record<string, string>;
}

export interface LockfileData {
  lockfileVersion: string;
  importers: Record<
    string,
    Deps & {
      specifiers: Record<string, string>;
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
  constructor(private rootNode: Node, private manager: Manager) {}

  private processNode(data: LockfileData, targetNode: Node) {
    for (const name in targetNode.edges) {
      const { wanted, node } = targetNode.edges[name];
      if (targetNode.isTop()) {
        // ...
      } else {
        // ...
      }
    }
  }

  output() {
    const data = {
      lockfileVersion: "0.0.1",
      importers: Object.create(null),
      packages: Object.create(null),
    };
    this.processNode(data, this.rootNode);
    return data as LockfileData;
  }
}
