import { gpi, PackageData } from "gpi";
import { depValid } from "./depValid";
import { tryReplace } from "./replace";
import type { Lockfile } from "./lockfile";
import { Node, RootPkgJson, ProjectPkgJson } from "./node";

type PackageNodes = Record<string, Node>;

export interface ManagerOptions {
  registry: string;
  lockfile: Lockfile;
  legacyPeerDeps: boolean;
}

export class Manager {
  // { react: { '1.0.0': Node } }
  public packages: Record<string, PackageNodes> = Object.create(null);
  private manifests = new Map<string, PackageData | Promise<PackageData>>();

  constructor(public opts: ManagerOptions) {}

  get lockfile() {
    return this.opts.lockfile;
  }

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
    tryReplace(this, node);
    this.packages[node.name][node.version] = node;
  }

  async createNode(name: string, wanted: string) {
    let pkgJson;
    let resolved;
    const lockInfo = this.lockfile.tryGetNodeManifest(name, wanted);

    if (lockInfo) {
      pkgJson = lockInfo;
      resolved = lockInfo.resolved;
    } else {
      pkgJson = await this.fetchManifest(name, wanted);
      resolved = (pkgJson as PackageData).dist.tarball;
    }

    return new Node({
      pkgJson,
      resolved,
      manager: this,
      type: "package",
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }

  createProjectNode(pkgJson: ProjectPkgJson) {
    return new Node({
      resolved: "",
      manager: this,
      type: "project",
      pkgJson: pkgJson as any,
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }

  createRootNode(
    pkgJson: RootPkgJson,
    workspaceJson: Record<string, ProjectPkgJson>
  ) {
    if (!pkgJson.name) pkgJson.name = ".";
    const workspace = Object.create(null);
    for (const key in workspaceJson) {
      if (key === pkgJson.name) {
        throw new Error(`Project\'s name cannot be "${pkgJson.name}"`);
      }
      workspaceJson[key].name = key;
      workspace[key] = this.createProjectNode(workspaceJson[key]);
    }

    return new Node({
      workspace,
      resolved: "",
      manager: this,
      type: "root",
      pkgJson: pkgJson as any,
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }
}
