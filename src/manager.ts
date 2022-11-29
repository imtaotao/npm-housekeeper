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
    for (const name in this.packages) {
      for (const version in this.packages[name]) {
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

  // a. resolutions 固定后保存到 lock 文件
  //  1. 如果有新增的包，lock 的 resolutions 里面没有，这里取空，还是会取原来的版本（bug）
  //    1.1 解决办法需要 merge 或者删掉 lock 文件
  //    2.2 merge 的好处是不需要删掉 lock 文件，这对于在浏览器里面使用很有用
  //  2. 如果是已经存在的包，不管版本有不有变化，这里都是会取锁定后的 resolutions
  //  3. 取到后重新存也是一模一样的版本
  //  4. 要想改动后的 resolutions 有变化，用户要删掉 lock 文件

  // b. resolutions 不保存到 lock 文件，但是当有 lock 文件时，忽略当前 package.json 中的 resolutions
  //  1. 如果有新增的包，没有 resolutions，则会取原本的版本（bug）
  //    1.1 解决办法需要删掉 lock 文件，yarn 也是这样处理的
  //  2. 如果是已经存在的包，则会取锁定的版本（已经被 resolutions 处理过的，不需要再过一边）
  //  3、要想改动后的 resolutions 有变化，用户要删掉 lock 文件
  tryGetResolution(parentName: string, depName: string) {
    // 暂时取 b 方案，性能好一点
    if (this.lockfile.json) return null;
    const parent = this.resolutions[parentName] || this.resolutions["**"];
    return parent ? parent[depName] : null;
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
