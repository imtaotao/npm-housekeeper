import type { PackageData } from "gpi";
import { Manager } from "./manager";

export type NodeType = "root" | "project" | "package";
export type EdgeType = "prod" | "dev" | "peer" | "peerOptional" | "optional";

export interface NodeOptions {
  type: NodeType;
  manager: Manager;
  pkgJson: PackageData;
  legacyPeerDeps: boolean;
  projects?: Array<Node>;
}

export interface Edge {
  node: Node;
  type: EdgeType;
  link: boolean;
  name: string;
  wanted: string;
}

export class Node {
  public name: string;
  public type: NodeType;
  public version: string;
  public pkg: PackageData;
  public manager: Manager;
  public legacyPeerDeps: boolean;
  public resolved: string | null;
  public projects: Array<Node> | null;
  public usedEdges = new Set<Edge>();
  public edges: Record<string, Edge> = Object.create(null);
  public errors: Array<Error | string> = [];

  constructor(opts: NodeOptions) {
    this.type = opts.type;
    this.pkg = opts.pkgJson;
    this.manager = opts.manager;
    this.name = opts.pkgJson.name;
    this.version = opts.pkgJson.version;
    this.projects = opts.projects || null;
    this.legacyPeerDeps = opts.legacyPeerDeps;
    this.resolved = opts.pkgJson.dist?.tarball || null;
  }

  isOptionalEdge(type: EdgeType) {
    return type === "optional" || type === "peerOptional";
  }

  isTop() {
    return this.type === "root" || this.type === "project";
  }

  hasError() {
    return this.errors.length > 0;
  }

  loadDeps() {
    const list = [];
    // 是否自动安装 peerDependencies
    const pd = this.pkg.peerDependencies;
    if (pd && typeof pd === "object" && !this.legacyPeerDeps) {
      const pm = this.pkg.peerDependenciesMeta || {};
      const peerDependencies: Record<string, string> = {};
      const peerOptional: Record<string, string> = {};
      for (const [name, dep] of Object.entries(pd)) {
        if (pm[name] && pm[name].optional) {
          peerOptional[name] = dep;
        } else {
          peerDependencies[name] = dep;
        }
      }
      list.push(this.loadDepType(peerDependencies, "peer"));
      list.push(this.loadDepType(peerOptional, "peerOptional"));
    }

    const { dependencies, devDependencies, optionalDependencies } = this.pkg;
    list.push(this.loadDepType(dependencies, "prod"));
    list.push(this.loadDepType(optionalDependencies, "optional"));
    // 只有项目需要安装 devDependencies
    if (this.isTop()) {
      list.push(this.loadDepType(devDependencies, "dev"));
    }
    return Promise.all(list);
  }

  private createEdge(node: Node, wanted: string, type: EdgeType) {
    const edge: Edge = Object.create(null);
    edge.link = true; // 所有的都是 link
    edge.node = node;
    edge.type = type;
    edge.wanted = wanted;
    edge.name = node.name;
    return edge;
  }

  private loadDepType(
    deps: Record<string, string> | undefined,
    type: EdgeType
  ) {
    const list = [];
    const ad = this.pkg.acceptDependencies || {};
    for (const [name, wanted] of Object.entries(deps || {})) {
      if (!name || this.edges[name]) continue;
      this.edges[name] = Object.create(null) as any; // 占位（如果是 optional 就可能是空对象）
      const node = this.manager.get(name, wanted, this, ad[name]);

      if (node) {
        this.edges[name] = this.createEdge(node, wanted, type);
        node.usedEdges.add(this.edges[name]);
      } else {
        list.push(
          this.manager
            .createNode(name, wanted)
            .then(async (node) => {
              this.manager.set(node);
              this.edges[name] = this.createEdge(node, wanted, type);
              node.usedEdges.add(this.edges[name]);
              // 子节点也要加载他自己的依赖
              await node.loadDeps();
            })
            .catch((e) => {
              // 如果是可选的，允许有错误发生
              if (!this.isOptionalEdge(type)) {
                this.errors.push(e);
              }
            })
        );
      }
    }
    return Promise.all(list);
  }
}
