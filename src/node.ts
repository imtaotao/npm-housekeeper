import type { Manager } from "./manager";

export type NodeType = "root" | "project" | "package";
export type EdgeType = "prod" | "dev" | "peer" | "peerOptional" | "optional";

export interface NodeDeps {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  acceptDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional: boolean }>;
}

export interface NodePkgJson extends NodeDeps {
  name: string;
  version: string;
}

export interface ProjectPkgJson extends NodeDeps {
  name?: string;
  version?: string;
}

export interface RootPkgJson extends NodeDeps {
  name?: string;
  workspace?: Record<string, ProjectPkgJson>;
}

export interface Edge {
  node: Node;
  type: EdgeType;
  link: boolean;
  name: string;
  wanted: string;
  parentNode: Node;
  accept?: string;
}

export interface NodeOptions {
  type: NodeType;
  resolved: string;
  manager: Manager;
  pkgJson: NodePkgJson;
  legacyPeerDeps: boolean;
  workspace?: Record<string, Node>;
}

export class Node {
  public name: string;
  public type: NodeType;
  public pkg: NodePkgJson;
  public version: string;
  public manager: Manager;
  public resolved: string;
  public legacyPeerDeps: boolean;
  public usedEdges = new Set<Edge>();
  public errors: Array<Error | string> = [];
  public workspace: Record<string, Node> | null;
  public edges: Record<string, Edge> = Object.create(null);

  constructor(opts: NodeOptions) {
    this.type = opts.type;
    this.pkg = opts.pkgJson;
    this.manager = opts.manager;
    this.name = opts.pkgJson.name;
    this.resolved = opts.resolved;
    this.version = opts.pkgJson.version;
    this.workspace = opts.workspace || null;
    this.legacyPeerDeps = opts.legacyPeerDeps;
  }

  isTop() {
    return this.type === "root" || this.type === "project";
  }

  isOptionalEdge(edgeType: EdgeType) {
    return edgeType === "optional" || edgeType === "peerOptional";
  }

  hasError() {
    return this.errors.length > 0;
  }

  add(name: string, version: string, edgeType: "prod" | "dev" | "peer") {
    if (!this.isTop()) {
      throw new Error("Only add dependencies to the top node");
    }
    this.loadSingleDepType(name, version, edgeType);
  }

  loadDeps() {
    const list = [];
    const {
      dependencies,
      devDependencies,
      optionalDependencies,
      peerDependencies: pd,
    } = this.pkg;

    // 安装 peerDependencies
    if (pd && !this.legacyPeerDeps) {
      const pm = this.pkg.peerDependenciesMeta || {};
      const peerOptional: Record<string, string> = {};
      const peerDependencies: Record<string, string> = {};

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

    // 安装其他的依赖
    list.push(this.loadDepType(dependencies, "prod"));
    list.push(this.loadDepType(optionalDependencies, "optional"));
    // 只有项目需要安装 devDependencies
    if (this.isTop()) {
      list.push(this.loadDepType(devDependencies, "dev"));
    }

    return Promise.all(list);
  }

  private loadDepType(
    deps: Record<string, string> | undefined,
    edgeType: EdgeType
  ) {
    if (!deps) return;
    const list = [];
    for (const [name, wanted] of Object.entries(deps)) {
      if (!name || this.edges[name]) continue;
      list.push(this.loadSingleDepType(name, wanted, edgeType));
    }
    return Promise.all(list);
  }

  // 这会强制更新 edge节点
  private async loadSingleDepType(
    name: string,
    wanted: string,
    edgeType: EdgeType
  ) {
    const ad = this.pkg.acceptDependencies || {};
    this.edges[name] = Object.create(null) as any; // 占位（如果是 optional 就可能是空对象）
    const accept = ad[name];
    const node = this.manager.get(name, wanted, this, accept);

    if (node) {
      this.edges[name] = this.createEdge(node, wanted, edgeType, accept);
      node.usedEdges.add(this.edges[name]);
    } else {
      const version = this.tryGetVersionInTop(name, wanted, edgeType);
      const searchWanted = version === null ? wanted : version;

      try {
        const node = await this.manager.createNode(name, searchWanted);
        this.edges[name] = this.createEdge(node, wanted, edgeType, accept);
        node.usedEdges.add(this.edges[name]);
        this.manager.set(node);
        // 子节点也要加载他自己的依赖
        await node.loadDeps();
      } catch (e: any) {
        // 如果是可选的，允许有错误发生
        if (!this.isOptionalEdge(edgeType)) {
          this.errors.push(e);
        }
      }
    }
  }

  private tryGetVersionInTop(name: string, wanted: string, edgeType: EdgeType) {
    if (!this.isTop()) return null;
    return this.manager.lockfile.tryGetTopEdgeVersion(
      this.name,
      name,
      wanted,
      edgeType
    );
  }

  private createEdge(
    node: Node,
    wanted: string,
    edgeType: EdgeType,
    accept?: string
  ) {
    const edge: Edge = Object.create(null);
    edge.node = node;
    edge.type = edgeType;
    edge.accept = accept;
    edge.wanted = wanted;
    edge.name = node.name;
    edge.parentNode = this;
    edge.link = true; // 所有的都是 link，我们是模仿 pnpm 的行为
    return edge;
  }
}
