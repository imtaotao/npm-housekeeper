import { gpi, PackageData } from "gpi";
import { depValid } from "./depValid";
import type { Lockfile } from "./lockfile";
import { Node, RootPkgJson, ProjectPkgJson } from "./node";

type EachCallback = (
  pkgName: string,
  version: string,
  node: Node
) => void | boolean;

export type FilterType = (name: string, wanted: string) => boolean;

export interface ManagerOptions {
  registry: string;
  lockfile: Lockfile;
  legacyPeerDeps: boolean;
  filter?: FilterType;
  customFetch?: typeof fetch;
}

export class Manager {
  // { react: { '1.0.0': Node } }
  private manifests = new Map<string, PackageData | Promise<PackageData>>();
  public packages: Record<string, Record<string, Node>> = Object.create(null);

  constructor(public opts: ManagerOptions) {}

  get lockfile() {
    return this.opts.lockfile;
  }

  // For the generated nodes,
  // some of them may be replaced by the current node,
  // and the same one should be reused as much as possible
  private tryReplace(target: Node) {
    const nodes = this.packages[target.name];
    if (nodes) {
      for (const version in nodes) {
        const node = nodes[version];
        if (node !== target) {
          for (const edge of node.usedEdges) {
            if (this.satisfiedBy(target, edge.wanted, null, edge.accept)) {
              edge.node = target;
              target.usedEdges.add(edge);
              node.usedEdges.delete(edge);
            }
          }
        }
      }
    }
  }

  fetchManifest(name: string, wanted: string) {
    const spec = `${name}@${wanted}`;
    if (this.manifests.has(spec)) {
      return this.manifests.get(spec)!;
    } else {
      const p = gpi(name, wanted, this.opts).then((mani) => {
        this.manifests.set(spec, mani);
        return mani;
      });
      this.manifests.set(spec, p);
      return p;
    }
  }

  each(callback: EachCallback) {
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

  logErrors() {
    this.each((_n, _v, node) => node.logErrors());
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
    this.tryReplace(node);
    this.packages[node.name][node.version] = node;
  }

  async createNode(name: string, wanted: string) {
    let pkgJson;
    let resolved;
    let integrity;
    const lockInfo = this.lockfile.tryGetNodeManifest(name, wanted);

    if (lockInfo) {
      pkgJson = lockInfo;
      resolved = lockInfo.resolved;
      integrity = lockInfo.integrity;
    } else {
      pkgJson = await this.fetchManifest(name, wanted);
      resolved = (pkgJson as PackageData).dist.tarball;
      integrity = (pkgJson as PackageData).dist.integrity;
    }

    return new Node({
      pkgJson,
      resolved,
      integrity,
      manager: this,
      type: "package",
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }

  createProjectNode(pkgJson: ProjectPkgJson) {
    return new Node({
      resolved: "",
      integrity: "",
      manager: this,
      type: "project",
      pkgJson: pkgJson as any,
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }

  createRootNode(
    pkgJson?: RootPkgJson,
    workspaceJson?: Record<string, ProjectPkgJson>
  ) {
    if (!pkgJson) pkgJson = Object.create(null);
    if (!pkgJson!.name) pkgJson!.name = ".";

    const workspace = Object.create(null);
    for (const key in workspaceJson) {
      if (key === pkgJson!.name) {
        throw new Error(`Project\'s name cannot be "${pkgJson!.name}"`);
      }
      workspaceJson[key].name = key;
      workspace[key] = this.createProjectNode(workspaceJson[key]);
    }

    return new Node({
      workspace,
      resolved: "",
      integrity: "",
      manager: this,
      type: "root",
      pkgJson: pkgJson as any,
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }
}
