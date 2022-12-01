import * as semver from "esm-semver";
import { gpi, PackageData } from "gpi";
import { depValid } from "./depValid";
import type { Lockfile } from "./lockfile";
import { EdgeType, Node, WorkspaceJson } from "./node";
import { isWs, getWsWanted, formatResolutions } from "./utils";

type EachCallback = (
  pkgName: string,
  version: string,
  node: Node
) => void | boolean;

export type FilterType = (
  name: string,
  wanted: string,
  type: EdgeType
) => boolean;

export interface ManagerOptions {
  lockfile: Lockfile;
  legacyPeerDeps: boolean;
  resolutions: Record<string, string>;
  registry?: string;
  filter?: FilterType;
  customFetch?: typeof fetch;
}

export class Manager {
  public replaceSet = new Set<() => void>();
  public workspace: Record<string, Node> = Object.create(null);
  public packages: Record<string, Record<string, Node>> = Object.create(null);
  public resolutions: ReturnType<typeof formatResolutions>; // { 'react-dom': { react: '1.0.0' } }
  private manifests = new Map<string, PackageData | Promise<PackageData>>(); // { react: { '1.0.0': Node } }

  constructor(public opts: ManagerOptions) {
    this.resolutions = formatResolutions(opts.resolutions);
  }

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
          this.replaceSet.add(() => {
            for (const edge of node.usedEdges) {
              if (this.satisfiedBy(target, edge.wanted, null, edge.accept)) {
                const move = () => {
                  edge.node = target;
                  target.usedEdges.add(edge);
                  node.usedEdges.delete(edge);
                };

                if (target.version === node.version) {
                  // The old ones may be deleted, because of asynchronous requests,
                  // nodes may be created repeatedly, and all are migrated to the same one here.
                  move();
                } else if (target.usedEdges.size > node.usedEdges.size) {
                  // We choose the version that uses more
                  move();
                } else if (target.usedEdges.size === node.usedEdges.size) {
                  // We choose the node with the higher version
                  if (semver.gt(target.version, node.version)) {
                    move();
                  }
                }
              }
            }
          });
        }
      }
    }
  }

  fetchManifest(name: string, wanted: string) {
    const spec = `${name}@${wanted}`;
    if (this.manifests.has(spec)) {
      return this.manifests.get(spec)!;
    } else {
      const { registry, customFetch } = this.opts;
      const p = gpi(name, wanted, { registry, customFetch }).then((mani) => {
        this.manifests.set(spec, mani);
        return mani;
      });
      this.manifests.set(spec, p);
      return p;
    }
  }

  get(name: string) {
    return this.workspace[name] || null;
  }

  each(callback: EachCallback) {
    let cbRes: any = true;
    let i = -1;
    const pKeys = Object.keys(this.packages).sort();
    while (++i < pKeys.length) {
      const name = pKeys[i];
      // Need to be sorted, high version is preferred
      const vKeys = Object.keys(this.packages[name]).sort();
      let j = vKeys.length;
      while (~--j) {
        const version = vKeys[j];
        cbRes = callback(name, version, this.packages[name][version]);
        if (cbRes === false) break;
      }
      if (cbRes === false) break;
    }
  }

  hasError() {
    for (const k in this.workspace) {
      if (this.workspace[k].hasError()) {
        return true;
      }
    }
    let e = false;
    this.each((_n, _v, node) => {
      if (node.hasError()) {
        e = true;
        return false;
      }
    });
    return e;
  }

  logError() {
    for (const k in this.workspace) {
      this.workspace[k].logErrors();
    }
    this.each((_n, _v, node) => node.logErrors());
  }

  // accept: '' => '*'
  satisfiedBy(node: Node, wanted: string, from: Node | null, accept?: string) {
    if (accept !== undefined) accept = accept || "*";
    return depValid(node, wanted, accept, from);
  }

  tryGetResolution(parentName: string, depName: string) {
    const parent = this.resolutions[parentName] || this.resolutions["**"];
    if (!parent || !parent[depName]) return null;
    return parent[depName].wanted;
  }

  setResolution(parentName: string, depName: string, version: string) {
    const parent = this.resolutions[parentName] || this.resolutions["**"];
    if (!parent || !parent[depName]) return;
    parent[depName].version = version;
  }

  tryGetReusableNode(
    name: string,
    wanted: string,
    from: Node,
    accept?: string
  ) {
    if (isWs(wanted)) {
      wanted = getWsWanted(wanted);
      const node = this.workspace[name];
      if (node) {
        if (this.satisfiedBy(node, wanted, from, accept)) {
          return node;
        }
      }
    } else {
      const nodes = this.packages[name];
      if (nodes) {
        for (const version in nodes) {
          const node = nodes[version];
          if (this.satisfiedBy(node, wanted, from, accept)) {
            return node;
          }
        }
      }
    }
    return null;
  }

  setReusableNode(node: Node) {
    if (node.isWorkspace()) {
      this.workspace[node.name] = node;
    } else {
      if (!this.packages[node.name]) {
        this.packages[node.name] = Object.create(null);
      }
      this.tryReplace(node);
      this.packages[node.name][node.version] = node;
    }
  }

  async createNode(name: string, wanted: string) {
    let pkgJson;
    let hasBin;
    let resolved;
    let integrity;
    const lockInfo = this.lockfile.tryGetNodeManifest(name, wanted);

    if (lockInfo) {
      pkgJson = lockInfo;
      resolved = lockInfo.resolved;
      integrity = lockInfo.integrity;
      hasBin = Boolean(lockInfo.hasBin);
    } else {
      pkgJson = await this.fetchManifest(name, wanted);
      resolved = (pkgJson as PackageData).dist.tarball;
      integrity = (pkgJson as PackageData).dist.integrity;
      hasBin = Boolean((pkgJson as PackageData).bin);
    }

    return new Node({
      hasBin,
      pkgJson,
      resolved,
      integrity,
      manager: this,
      type: "package",
      legacyPeerDeps: this.opts.legacyPeerDeps,
    });
  }

  createWorkspaceNode(pkgJson: WorkspaceJson) {
    return new Node({
      integrity: "",
      manager: this,
      type: "workspace",
      hasBin: Boolean(pkgJson.bin),
      resolved: pkgJson.resolved || "",
      legacyPeerDeps: this.opts.legacyPeerDeps,
      pkgJson: pkgJson as Required<WorkspaceJson>,
    });
  }
}
