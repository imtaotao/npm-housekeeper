import * as semver from "esm-semver";
import { gpi, PackageData } from "gpi";
import { depValid } from "./depValid";
import { cropEmptyNodes } from "./cropPkgs";
import type { Lockfile } from "./lockfile";
import { EdgeType, Node, WorkspaceJson } from "./node";
import { isWs, getWsWanted, createDefer, formatResolutions } from "./utils";

type EachCallback = (
  pkgName: string,
  version: string,
  node: Node
) => void | boolean;

export type RetryType = (
  name: string,
  times: number,
  retry: () => void
) => boolean | void;

export type FilterType = (
  name: string,
  wanted: string,
  type: EdgeType
) => boolean;

export interface ManagerOptions {
  lockfile: Lockfile;
  legacyPeerDeps: boolean;
  resolutions: Record<string, string>;
  retry?: RetryType;
  registry?: string;
  filter?: FilterType;
  customFetch?: typeof fetch;
}

export class Manager {
  public workspace: Record<string, Node> = Object.create(null);
  public packages: Record<string, Record<string, Node>> = Object.create(null);
  private resolutions: ReturnType<typeof formatResolutions>; // { 'react-dom': { react: '1.0.0' } }
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
  tryReplace(target: Node) {
    if (target.isWorkspace()) return;
    const nodes = this.packages[target.name];
    if (!nodes) return;

    for (const version in nodes) {
      const node = nodes[version];
      if (node === target) continue;
      for (const edge of node.usedEdges) {
        if (target.version === node.version || this.satisfiedBy(target, edge.wanted, null, edge.accept)) {
          edge.node = target;
          target.usedEdges.add(edge);
          node.usedEdges.delete(edge);
        }
      }
    }
  }

  prune() {
    cropEmptyNodes(this);
  }

  fetchManifest(name: string, wanted: string) {
    const spec = `${name}@${wanted}`;
    if (this.manifests.has(spec)) {
      return this.manifests.get(spec)!;
    } else {
      let times = 0;
      let canContinue: boolean | void;
      const { retry, registry, customFetch } = this.opts;

      const request = () => {
        const p = gpi(name, wanted, { registry, customFetch })
          .then((mani) => {
            this.manifests.set(spec, mani);
            return mani;
          })
          .catch(async (e) => {
            if (retry && canContinue !== false) {
              const defer = createDefer();
              canContinue = retry(name, ++times, () => {
                request().then(defer.resolve, defer.reject);
              });
              await defer.p;
            }
            throw e;
          });
        this.manifests.set(spec, p);
        return p;
      };

      return request();
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
