import { gpi } from "gpi";
import type { PackageData } from "gpi";
import { Node } from "./node";
import { depValid } from "./depValid";
import { tryToReplace } from "./replace";

type PackageNodes = Record<string, Node>;

export interface ManagerOptions {
  registry: string;
  legacyPeerDeps: boolean;
}

export class Manager {
  // { react: { '1.0.0': Node } }
  public packages: Record<string, PackageNodes> = Object.create(null);
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

  each(
    callback: (pkgName: string, version: string, node: Node) => void | boolean
  ) {
    let needBreak = false;
    for (const name in this.packages) {
      for (const version in this.packages[name]) {
        const node = this.packages[name][version];
        const res = callback(name, version, node);
        if (res === false) {
          needBreak = true;
          break;
        }
      }
      if (needBreak) break;
    }
  }

  cropEmptyPackages() {
    this.each((name, version, node) => {
      if (node.usedEdges.size === 0) {
        delete this.packages[name][version];
      }
    });
  }

  // accept: '' => '*'
  satisfiedBy(node: Node, wanted: string, from: Node | null, accept?: string) {
    if (accept !== undefined) accept = accept || "*";
    return depValid(node, wanted, accept, from);
  }

  get(name: string, wanted: string, from: Node, accept?: string) {
    const nodes = this.packages[name];
    if (nodes) {
      for (const version in nodes) {
        const node = nodes[version];
        if (this.satisfiedBy(node, wanted, from, accept)) {
          return node;
        }
      }
    }
    return null;
  }

  set(node: Node) {
    if (!this.packages[node.name]) {
      this.packages[node.name] = Object.create(null);
    }
    // tryToReplace(this, node);
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
