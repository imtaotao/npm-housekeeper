import { gpi } from "gpi";
import type { PackageData } from "gpi";
import { Node } from "./node";
import { depValid } from "./depValid";
import { tryToReplace } from './replace';

export type SpecificPackages = Record<string, Node>;

export interface ManagerOptions {
  registry: string;
  legacyPeerDeps: boolean;
}

export class Manager {
  // { react: { '1.0.0': Node } }
  public packages: Record<string, SpecificPackages> = Object.create(null);
  private manifests = new Map<string, PackageData | Promise<PackageData>>();

  constructor(public opts: ManagerOptions) {}

  fetchManifest(name: string, wanted: string) {
    const spec = `${name}@${wanted}`;
    if (this.manifests.has(spec)) {
      return this.manifests.get(spec)!;
    } else {
      const p = gpi(name, wanted).then((mani) => {
        this.manifests.set(spec, mani);
        return mani;
      });
      this.manifests.set(spec, p);
      return p;
    }
  }

  // accept: '' => '*'
  satisfiedBy(node: Node, wanted: string, from: Node, accept?: string) {
    if (accept !== undefined) accept = accept || "*";
    return depValid(node, wanted, accept, from);
  }

  get(name: string, wanted: string, from: Node, accept?: string) {
    const nodes = this.packages[name];
    if (nodes) {
      for (const version in nodes) {
        const targetNode = nodes[version];
        if (this.satisfiedBy(targetNode, wanted, from, accept)) {
          return targetNode;
        }
      }
    }
    return null;
  }

  set(node: Node) {
    if (!this.packages[node.name]) {
      this.packages[node.name] = Object.create(null);
    }
    tryToReplace(node, this.packages[node.name]);
    this.packages[node.name][node.version] = node;
  }

  async createNode(name: string, wanted: string) {
    const pkgJson = await this.fetchManifest(name, wanted);
    return new Node({
      pkgJson,
      manager: this,
      type: "package",
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }

  createProjectNode(pkgJson: PackageData) {
    return new Node({
      pkgJson,
      manager: this,
      type: "project",
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }

  createRootNode(pkgJson: PackageData, projects: Array<PackageData>) {
    return new Node({
      pkgJson,
      manager: this,
      type: "root",
      legacyPeerDeps: this.opts.legacyPeerDeps,
      projects: projects.map((json) => this.createProjectNode(json)),
    });
  }
}
