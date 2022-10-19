import { gpi, PackageData } from "gpi";
import { Node, PackageJson } from "./node";
import { Edge } from "./edge";

export interface BuildTreeOptions {
  registry?: string;
  legacyPeerDeps?: boolean;
}

// 根据 package.json 和 lockfile 构建出一颗理想的树
export class IdealTreeBuilder {
  idealTree?: Node;
  registry: string;
  legacyPeerDeps: boolean;
  private depsSeen = new Set<Node>();
  private loadFailures = new Set<Node>();
  private virtualRoots = new Map<Node, Node>();
  private manifests = new Map<string, PackageData | Promise<PackageData>>();
  private currentDep?: Node;

  constructor(opts: BuildTreeOptions = {}) {
    this.legacyPeerDeps = opts.legacyPeerDeps || false;
    this.registry = opts.registry || "https://registry.npmjs.org";
    if (!this.registry.endsWith("/")) this.registry += "/";
  }

  async build(pkg: PackageJson) {
    this.idealTree = this.rootNodeFromPackage(pkg);
    await this.buildDepStep(this.idealTree);
    return this.idealTree;
  }

  // 根据 edges 来生成 node
  private async buildDepStep(node: Node) {
    if (this.depsSeen.has(node)) {
      return;
    }
    this.depsSeen.add(node);
    this.currentDep = node;

    for (const edge of this.problemEdges(node)) {
      if (edge.peerConflicted) {
        continue;
      }
      const vrDep = edge.valid && edge.to;
      const dep =
        vrDep && vrDep.satisfies(edge)
          ? vrDep
          : await this.nodeFromEdge(edge, node, null);

      console.log(dep);
    }
  }

  // 跳过失败的 edges，否则在后面的安装中会崩溃
  private problemEdges(node: Node) {
    return [...node.edgesOut.values()].filter((edge) => {
      if (edge.to && this.loadFailures.has(edge.to)) {
        return false;
      }
      // 如果 edge 没有 to，那就有问题了，除非它是 peerOptional
      if (!edge.to) {
        return edge.type !== "peerOptional";
      }
      return false;
    });
  }

  private async nodeFromEdge(
    edge: Edge,
    _parent: Node | null,
    secondEdge: Edge | null
  ) {
    const parent = _parent || this.virtualRoot(edge.from!);
    const p1 = this.nodeFromSpec(edge.name, edge.spec, parent, edge);
    const p2 =
      secondEdge && !secondEdge.valid
        ? this.nodeFromSpec(edge.name, secondEdge.spec, parent, secondEdge)
        : null;
    const [first, second] = await Promise.all([p1, p2]);
    const node = second && edge.valid ? second : first;
    node.parent = parent;
    return this.loadPeerSet(node);
  }

  private async loadPeerSet(node: Node) {
    for (const e of node.edgesOut.values()) {
      if (!e.peer || (e.valid && e.to)) {
        continue;
      }
      const parentEdge = node.parent?.edgesOut.get(e.name);
      const conflictOK = node.parent?.sourceReference?.isRoot;

      if (!e.to) {
        if (!parentEdge) {
          const dep = await this.nodeFromEdge(e, node.parent, null);
          node.setChild(dep);
        } else {
          // 如果父 edge 非常宽泛，比如 >=1，而 edge 是类似 1.x 的，那么我们想得到的是 1.x，而不是2.x，沿着子边传递作为咨询准则。
          // 如果父边不满足子边，而子边又不满足父边，那么我们就有冲突了。
          const dep = await this.nodeFromEdge(parentEdge, node.parent, e);

          if (e.valid) {
            continue;
          } else if (e.missing) {
            node.setChild(dep);
            continue;
          }
          if (conflictOK) {
            e.peerConflicted = true;
            continue;
          }
          // 父子 edge 冲突
          throw new Error("unable to resolve dependency tree");
        }
      }
    }
    return node;
  }

  private async nodeFromSpec(
    name: string,
    wanted: string,
    parent: Node,
    edge: Edge
  ) {
    try {
      const pkg = await this.fetchManifest(name, wanted);
      return new Node({
        pkg,
        parent,
        location: "",
        legacyPeerDeps: this.legacyPeerDeps,
      });
    } catch (error: any) {
      (error as any).requiredBy = edge.from?.location || ".";
      // 如果有错误，也要记录下来，因为后面要验证，这个可能是可选的包
      const node = new Node({
        parent,
        error,
        location: "",
        pkg: { name, version: "" },
        legacyPeerDeps: this.legacyPeerDeps,
      });
      this.loadFailures.add(node);
      return node;
    }
  }

  private rootNodeFromPackage(pkg: PackageJson) {
    const root = new Node({
      pkg,
      location: "",
      parent: null,
      legacyPeerDeps: this.legacyPeerDeps,
    });
    root.root = root;
    return root;
  }

  private fetchManifest(name: string, wanted: string) {
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

  // 一个 node 作为根节点去处理他自己的依赖
  private virtualRoot(node: Node, reuse = false) {
    if (reuse && this.virtualRoots.has(node)) {
      return this.virtualRoots.get(node)!;
    }
    const vr = new Node({
      parent: null,
      pkg: node.pkg,
      sourceReference: node,
      location: node.location,
      legacyPeerDeps: this.legacyPeerDeps,
    });
    this.virtualRoots.set(node, vr);
    return vr;
  }
}
