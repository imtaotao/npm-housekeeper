import type { Manager } from "./manager";
export type NodeType = "workspace" | "package";
export type EdgeType = "prod" | "dev" | "peer" | "peerOptional" | "optional";
export interface NodeDeps {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  acceptDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<
    string,
    {
      optional: boolean;
    }
  >;
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
  resolution: string | null;
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
export declare class Node {
  name: string;
  type: NodeType;
  pkg: NodePkgJson;
  version: string;
  hasBin: boolean;
  manager: Manager;
  resolved: string;
  integrity: string;
  legacyPeerDeps: boolean;
  usedEdges: Set<Edge>;
  errors: Array<Error | string>;
  edges: Record<string, Edge>;
  constructor(opts: NodeOptions);
  isWorkspace(): boolean;
  isOptionalEdge(edgeType: EdgeType): boolean;
  hasError(): boolean;
  logErrors(): void;
  add(
    name: string,
    version?: string,
    edgeType?: EdgeType,
    force?: boolean
  ): Promise<Node | null>;
  loadDeps(): Promise<((Node | Error | null)[] | undefined)[]>;
  private loadDepType;
  private loadSingleDepType;
  private tryGetVersionInWorkspace;
  private createEdge;
}
