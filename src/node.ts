import type { PackageData } from "gpi";
import { Edge, Type } from "./edge";

export type PackageJson = Omit<PackageData, "dist">;

interface NodeOptions {
  location: string;
  parent: Node | null;
  pkg: PackageData | PackageJson;
  error?: Error | string;
  sourceReference?: Node;
  legacyPeerDeps?: boolean;
}

export class Node {
  errors: Array<string | Error> = [];
  edgesIn = new Set<Edge>(); // 依赖该 node 的其他的 node（同名且版本匹配）
  edgesOut = new Map<string, Edge>(); // 该 node 依赖的其他 node（依赖）
  children = new Map<string, Node>(); // 子 node_modules
  location: string;
  parent: Node | null = null;
  pkg: PackageData | PackageJson;
  legacyPeerDeps: boolean;
  sourceReference?: Node;
  private _root: null | Node = null;

  constructor(opts: NodeOptions) {
    this.location = opts.location;
    this.parent = opts.parent || null;
    this.legacyPeerDeps = opts.legacyPeerDeps || false;
    this.sourceReference = opts.sourceReference;
    this.pkg = opts.sourceReference ? opts.sourceReference.pkg : opts.pkg;
    if (opts.error) {
      this.errors.push(opts.error);
    }
    this.loadDeps();
  }

  get name() {
    return this.pkg.name;
  }

  get version() {
    return this.pkg.version;
  }

  get depth(): number {
    return this.isTop ? 0 : this.parent!.depth + 1;
  }

  get resolved(): string | null {
    return (this.pkg as any).dist?.tarball || null;
  }

  get isTop() {
    return !this.parent;
  }

  get isRoot() {
    return this === this.root;
  }

  get root() {
    return this._root;
  }

  set root(n: Node | null) {
    this._root = n;
  }

  private loadDeps() {
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
      this.loadDepType(peerDependencies, "peer");
      this.loadDepType(peerOptional, "peerOptional");
    }
    const { dependencies, devDependencies, optionalDependencies } = this.pkg;
    this.loadDepType(dependencies, "prod");
    this.loadDepType(optionalDependencies, "optional");
    // 只有根项目需要安装 devDependencies
    if (this.isTop && (!this.sourceReference || this.sourceReference.isTop)) {
      this.loadDepType(devDependencies, "dev");
    }
  }

  private loadDepType(deps: Record<string, string> | undefined, type: Type) {
    const ad = this.pkg.acceptDependencies || {};
    for (const [name, spec] of Object.entries(deps || {})) {
      const current = this.edgesOut.get(name);
      if (!current) {
        new Edge({ from: this, name, spec, accept: ad[name], type });
      }
    }
  }

  setChild(child: Node) {
    this.children.set(child.name, child);
    this.edgesOut.get(child.name)?.reload();
  }

  resolve(name: string): Node | null {
    const mine = this.children.get(name);
    if (mine) return mine;
    if (this.parent) return this.parent.resolve(name);
    return null;
  }

  satisfies(edge: Edge) {
    return edge.satisfiedBy(this);
  }

  addEdgeOut(edge: Edge) {
    this.edgesOut.set(edge.name, edge);
  }

  addEdgeIn(edge: Edge) {
    this.edgesIn.add(edge);
  }
}
