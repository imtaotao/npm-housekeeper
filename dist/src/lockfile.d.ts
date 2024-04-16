import type { Manager } from "./manager";
import type { EdgeType, NodeDeps } from "./node";
export interface ImporterValue extends NodeDeps {
  specifiers?: Record<string, string>;
}
export interface PackageValue extends NodeDeps {
  resolved: string;
  integrity: string;
  hasBin?: boolean;
}
export type Packages = Record<string, Record<string, PackageValue>>;
export interface LockfileJson {
  lockfileVersion: string;
  packages: Packages;
  importers: Record<string, ImporterValue>;
}
interface LockfileOptions {
  managerGetter: () => Manager;
  json?: LockfileJson | string | null;
}
export declare class Lockfile {
  version: string;
  json?: LockfileJson;
  private managerGetter;
  constructor(opts: LockfileOptions);
  private canUse;
  private recordDeps;
  private processWorkspaceNode;
  private processPackageNodes;
  tryGetNodeManifest(
    name: string,
    version: string
  ): {
    resolved: string;
    integrity: string;
    hasBin?: boolean | undefined;
    dependencies?: Record<string, string> | undefined;
    devDependencies?: Record<string, string> | undefined;
    peerDependencies?: Record<string, string> | undefined;
    acceptDependencies?: Record<string, string> | undefined;
    optionalDependencies?: Record<string, string> | undefined;
    peerDependenciesMeta?:
      | Record<
          string,
          {
            optional: boolean;
          }
        >
      | undefined;
    name: string;
    version: string;
  } | null;
  tryGetEdgeVersion(
    pname: string,
    name: string,
    wanted: string,
    edgeType: EdgeType
  ): string | null;
  set(json?: LockfileJson | string | null): boolean;
  output(): LockfileJson | null;
  diff(
    newJson: LockfileJson,
    type?: "all" | "add" | "remove",
    oldJson?: LockfileJson | undefined
  ): {
    add: Packages;
    remove: Packages;
  };
}
export {};
