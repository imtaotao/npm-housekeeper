import type { Manager } from "./manager";
import { getDepPropByEdgeType } from "./utils";

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
  integrity: string;
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
  public integrity: string;
  public legacyPeerDeps: boolean;
  public usedEdges = new Set<Edge>();
  public errors: Array<Error | string> = [];
  public workspace: Record<string, Node> | null;
  public edges: Record<string, Edge> = Object.create(null);

  constructor(opts: NodeOptions) {
    this.pkg = opts.pkgJson;
    this.name = opts.pkgJson.name;
    this.version = opts.pkgJson.version;
    this.type = opts.type;
    this.manager = opts.manager;
    this.resolved = opts.resolved;
    this.integrity = opts.integrity;
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

  logErrors() {
    for (let e of this.errors) {
      if (typeof e === "string") {
        e = `(${this.name}): ${e}`;
      } else if (e instanceof Error) {
        try {
          e.message = `(${this.name}): ${e.message}`;
        } catch (e) {}
      }
      console.error(e);
    }
  }

  async add(
    name: string,
    version = "latest",
    edgeType: EdgeType = "prod",
    force?: boolean
  ) {
    if (!force && !this.isTop()) {
      throw new Error("Only add dependencies to the top node");
    }
    const nodeOrErr = await this.loadSingleDepType(name, version, edgeType);

    if (!nodeOrErr || nodeOrErr instanceof Node) {
      const prop = getDepPropByEdgeType(edgeType, true);
      if (!this.pkg[prop]) this.pkg[prop] = Object.create(null);
      this.pkg[prop]![name] = version;
      return nodeOrErr;
    } else {
      throw nodeOrErr;
    }
  }

  loadDeps() {
    const ls = [];
    const {
      dependencies,
      devDependencies,
      optionalDependencies,
      peerDependencies: pd,
    } = this.pkg;

    // install peerDependencies
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
      ls.push(this.loadDepType(peerDependencies, "peer"));
      ls.push(this.loadDepType(peerOptional, "peerOptional"));
    }

    // Install other dependencies
    ls.push(this.loadDepType(dependencies, "prod"));
    ls.push(this.loadDepType(optionalDependencies, "optional"));

    // Only `topNode` require devDependencies to be installed
    if (this.isTop()) {
      ls.push(this.loadDepType(devDependencies, "dev"));
    }
    return Promise.all(ls);
  }

  private loadDepType(
    deps: Record<string, string> | undefined,
    edgeType: EdgeType
  ) {
    if (!deps) return;
    const ls = [];
    for (const [name, wanted] of Object.entries(deps)) {
      if (!name || this.edges[name]) continue;
      if (typeof this.manager.opts.filter === "function") {
        if (this.manager.opts.filter(name, wanted)) {
          continue;
        }
      }
      ls.push(this.loadSingleDepType(name, wanted, edgeType));
    }
    return Promise.all(ls);
  }

  // This will force an update of the edge nodes
  private async loadSingleDepType(
    name: string,
    wanted: string,
    edgeType: EdgeType
  ) {
    const ad = this.pkg.acceptDependencies || {};
    // Placeholder (may be an empty object if optional)
    this.edges[name] = Object.create(null) as any;
    const accept = ad[name];
    const node = this.manager.get(name, wanted, this, accept);

    if (node) {
      this.edges[name] = this.createEdge(node, wanted, edgeType, accept);
      node.usedEdges.add(this.edges[name]);
      return node;
    }

    try {
      const version = this.tryGetVersionInTop(name, wanted, edgeType);
      const searchWanted = version === null ? wanted : version;
      const node = await this.manager.createNode(name, searchWanted);

      this.edges[name] = this.createEdge(node, wanted, edgeType, accept);
      node.usedEdges.add(this.edges[name]);
      this.manager.set(node);
      // The child node also has to load his own dependencies
      await node.loadDeps();
      return node;
    } catch (e: any) {
      delete this.edges[name];

      // If optional, allow errors to occur
      if (this.isOptionalEdge(edgeType)) {
        return null;
      } else {
        this.errors.push(e);
        return e as Error;
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
    // All are links, we are mimicking the behavior of pnpm
    edge.link = true;
    return edge;
  }
}
