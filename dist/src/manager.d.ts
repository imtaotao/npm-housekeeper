import { RetryType, PackageData } from "gpi";
import type { Lockfile } from "./lockfile";
import { EdgeType, Node, WorkspaceJson } from "./node";
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
  retry?: RetryType;
  registry?: string;
  filter?: FilterType;
  customFetch?: typeof fetch;
}
export declare class Manager {
  opts: ManagerOptions;
  workspace: Record<string, Node>;
  packages: Record<string, Record<string, Node>>;
  private resolutions;
  private manifests;
  constructor(opts: ManagerOptions);
  get lockfile(): Lockfile;
  tryReplace(target: Node): void;
  prune(): void;
  fetchManifest(
    name: string,
    wanted: string
  ): PackageData | Promise<PackageData>;
  get(name: string): Node;
  each(callback: EachCallback): void;
  hasError(): boolean;
  logError(): void;
  satisfiedBy(
    node: Node,
    wanted: string,
    from: Node | null,
    accept?: string
  ): boolean;
  tryGetResolution(parentName: string, depName: string): string | null;
  tryGetReusableNode(
    name: string,
    wanted: string,
    from: Node,
    accept?: string
  ): Node | null;
  setReusableNode(node: Node): void;
  createNode(name: string, wanted: string): Promise<Node>;
  createWorkspaceNode(pkgJson: WorkspaceJson): Node;
}
export {};
