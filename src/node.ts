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
}

export interface RootPkgJson extends NodeDeps {
  name?: string;
  projects?: Record<string, ProjectPkgJson>;
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
  projects?: Record<string, Node>;
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
  public projects: Record<string, Node> | null;
  public edges: Record<string, Edge> = Object.create(null);

  constructor(opts: NodeOptions) {
    this.type = opts.type;
    this.pkg = opts.pkgJson;
    this.manager = opts.manager;
    this.name = opts.pkgJson.name;
    this.resolved = opts.resolved;
    this.version = opts.pkgJson.version;
    this.projects = opts.projects || null;
    this.legacyPeerDeps = opts.legacyPeerDeps;
  }

  isTop() {
    return this.type === "root" || this.type === "project";
  }

  isOptionalEdge(type: EdgeType) {
    return type === "optional" || type === "peerOptional";
  }

  hasError() {
    return this.errors.length > 0;
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
    type: EdgeType
  ) {
    if (!deps) return;
    const list = [];
    const ad = this.pkg.acceptDependencies || {};
    for (const [name, wanted] of Object.entries(deps)) {
      if (!name || this.edges[name]) continue;
      this.edges[name] = Object.create(null) as any; // 占位（如果是 optional 就可能是空对象）
      const accept = ad[name];
      const node = this.manager.get(name, wanted, this, accept);

      if (node) {
        this.edges[name] = this.createEdge(node, wanted, type, accept);
        node.usedEdges.add(this.edges[name]);
      } else {
        const version = this.tryGetVersionInTop(name, wanted, type);
        const searchWanted = version === null ? wanted : version;
        list.push(
          this.manager
            .createNode(name, searchWanted)
            .then(async (node) => {
              this.edges[name] = this.createEdge(node, wanted, type, accept);
              node.usedEdges.add(this.edges[name]);
              this.manager.set(node);
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

  private tryGetVersionInTop(name: string, wanted: string, type: EdgeType) {
    if (!this.isTop()) return null;
    return this.manager.lockfile.tryGetTopEdgeVersion(
      this.name,
      name,
      wanted,
      type
    );
  }

  private createEdge(
    node: Node,
    wanted: string,
    type: EdgeType,
    accept?: string
  ) {
    const edge: Edge = Object.create(null);
    edge.node = node;
    edge.type = type;
    edge.accept = accept;
    edge.wanted = wanted;
    edge.name = node.name;
    edge.parentNode = this;
    edge.link = true; // 所有的都是 link，我们是模仿 pnpm 的行为
    return edge;
  }
}
