import type { Manager } from "./manager";
import { wf, isWs, getDepPropByEdgeType } from "./utils";

export type NodeType = "workspace" | "package";
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
  bin?: string | Record<string, string>;
}

export interface WorkspaceJson extends NodeDeps {
  name?: string;
  version?: string;
  resolved?: string;
  bin?: string | Record<string, string>;
}

export interface Edge {
  ws: boolean;
  type: EdgeType;
  link: boolean;
  name: string;
  wanted: string;
  parentNode: Node;
  node?: Node;
  accept?: string;
}

export interface NodeOptions {
  type: NodeType;
  hasBin: boolean;
  resolved: string;
  integrity: string;
  manager: Manager;
  pkgJson: NodePkgJson;
  legacyPeerDeps: boolean;
}

export class Node {
  public name: string;
  public type: NodeType;
  public pkg: NodePkgJson;
  public version: string;
  public hasBin: boolean;
  public manager: Manager;
  public resolved: string;
  public integrity: string;
  public legacyPeerDeps: boolean;
  public usedEdges = new Set<Edge>();
  public errors: Array<Error | string> = [];
  public edges: Record<string, Edge> = Object.create(null);

  constructor(opts: NodeOptions) {
    this.pkg = opts.pkgJson;
    this.name = opts.pkgJson.name;
    this.version = opts.pkgJson.version;
    this.type = opts.type;
    this.hasBin = opts.hasBin;
    this.manager = opts.manager;
    this.resolved = opts.resolved;
    this.integrity = opts.integrity;
    this.legacyPeerDeps = opts.legacyPeerDeps;
  }

  isWorkspace() {
    return this.type === "workspace";
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
    if (!force && !this.isWorkspace()) {
      throw new Error("Only add dependencies to the workspace node");
    }
    version = this.manager.tryGetResolution(this.name, name) || version;
    const accept = (this.pkg.acceptDependencies || {})[name];
    const nodeOrErr = await this.loadSingleDepType(
      name,
      version,
      edgeType,
      accept
    );

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

    // Only `workspaceNode` require devDependencies to be installed
    if (this.isWorkspace()) {
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
    const ad = this.pkg.acceptDependencies || {};

    for (let [name, wanted] of Object.entries(deps)) {
      if (!name || this.edges[name]) continue;
      // Handling resolutions
      wanted = this.manager.tryGetResolution(this.name, name) || wanted;
      const accept = ad[name];
      if (typeof this.manager.opts.filter === "function") {
        if (this.manager.opts.filter(name, wanted, edgeType)) {
          this.edges[name] = this.createEdge(name, wanted, edgeType, accept);
          continue;
        }
      }
      ls.push(this.loadSingleDepType(name, wanted, edgeType, accept));
    }
    return Promise.all(ls);
  }

  // This will force an update of the edge nodes
  private async loadSingleDepType(
    name: string,
    wanted: string,
    edgeType: EdgeType,
    accept?: string
  ) {
    const isws = isWs(wanted);
    if (isws && !this.isWorkspace()) {
      const e = new Error(`Only workspace nodes can use "${wf}"`);
      this.errors.push(e);
      return e;
    }
    // Placeholder (may be an empty object if optional)
    this.edges[name] = Object.create(null) as any;
    const node = this.manager.tryGetReusableNode(name, wanted, this, accept);

    if (node) {
      this.edges[name] = this.createEdge(name, wanted, edgeType, accept, node);
      node.usedEdges.add(this.edges[name]);
      return node;
    } else if (isws) {
      const e = new Error(
        `There are no available "${name}" nodes in workspace`
      );
      this.errors.push(e);
      return e;
    } else {
      try {
        const version = this.tryGetVersionInWorkspace(name, wanted, edgeType);
        const searchWanted = version === null ? wanted : version;
        const node = await this.manager.createNode(name, searchWanted);

        this.edges[name] = this.createEdge(
          name,
          wanted,
          edgeType,
          accept,
          node
        );
        node.usedEdges.add(this.edges[name]);
        this.manager.setReusableNode(node);
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
  }

  private tryGetVersionInWorkspace(
    name: string,
    wanted: string,
    edgeType: EdgeType
  ) {
    if (!this.isWorkspace()) return null;
    return this.manager.lockfile.tryGetEdgeVersion(
      this.name,
      name,
      wanted,
      edgeType
    );
  }

  private createEdge(
    name: string,
    wanted: string,
    edgeType: EdgeType,
    accept?: string,
    node?: Node
  ) {
    const edge: Edge = Object.create(null);
    edge.node = node;
    edge.name = name;
    edge.type = edgeType;
    edge.accept = accept;
    edge.wanted = wanted;
    edge.parentNode = this;
    edge.ws = isWs(wanted);
    // All are links, we are mimicking the behavior of pnpm
    edge.link = true;
    return edge;
  }
}
