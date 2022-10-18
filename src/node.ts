import type { PackageData } from "gpi";
import { Edge, Type } from "./edge";

export type PackageJson = Omit<PackageData, "dist">;

interface NodeOptions {
  location: string;
  root: Node | null;
  parent: Node | null;
  pkg: PackageData | PackageJson;
  dev: boolean;
  devOptional: boolean;
  peer: boolean;
  optional: boolean;
  legacyPeerDeps: boolean;
}

export class Node {
  errors: Array<string | Error> = [];
  edgesIn = new Set<Edge>(); // 依赖该 node 的其他的 node（同名且版本匹配）
  edgesOut = new Map<string, Edge>(); // 该 node 依赖的其他 node（依赖）
  children = new Map<string, Node>(); // 子 node_modules
  location: string;
  root: Node | null;
  parent: Node | null = null;
  pkg: PackageData | PackageJson;
  dev: boolean;
  devOptional: boolean;
  peer: boolean;
  optional: boolean;
  legacyPeerDeps: boolean;

  constructor(opts: NodeOptions) {
    this.pkg = opts.pkg;
    this.location = opts.location;
    this.parent = opts.parent || null;
    this.root = opts.parent ? null : opts.root || null;
    this.dev = opts.dev;
    this.peer = opts.peer;
    this.optional = opts.optional;
    this.devOptional = opts.devOptional;
    this.legacyPeerDeps = opts.legacyPeerDeps;
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

  private loadDeps() {
    // 自动安装 peerDependencies
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
    if (this.isTop) {
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

  resolve(name: string): Node | null {
    const mine = this.children.get(name);
    if (mine) return mine;
    if (this.parent) return this.parent.resolve(name);
    return null;
  }

  addEdgeOut(edge: Edge) {
    this.edgesOut.set(edge.name, edge);
  }

  addEdgeIn(edge: Edge) {
    this.edgesIn.add(edge);
  }
}
