import type { EdgeType } from "./node";
import type { LockfileJson } from "./lockfile";
export declare const wf = "workspace:";
export declare const isWs: (spec: string) => boolean;
export declare const getWsWanted: (spec: string) => string;
export declare const isEmptyObject: (obj: Record<string, any>) => boolean;
export declare const getDepPropByEdgeType: (
  edgeType: EdgeType,
  isGet: boolean
) =>
  | "dependencies"
  | "devDependencies"
  | "optionalDependencies"
  | "peerDependencies"
  | "peerDependenciesMeta";
export declare const formatLockfileData: (
  lockfileData?: string | LockfileJson | null
) => LockfileJson | null | undefined;
interface ResolutionValue {
  raw: string;
  wanted: string;
}
export declare const formatResolutions: (
  resolutions: Record<string, string>
) => Record<string, Record<string, ResolutionValue>>;
export {};
