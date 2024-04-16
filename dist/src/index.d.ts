import type { RetryType } from "gpi";
import type { WorkspaceJson } from "./node";
import { Manager, FilterType } from "./manager";
import { LockfileJson } from "./lockfile";
export interface InstallOptions {
  registry?: string;
  retry?: RetryType;
  filter?: FilterType;
  legacyPeerDeps?: boolean;
  customFetch?: typeof fetch;
  resolutions?: Record<string, string>;
  lockData?: LockfileJson | string | null;
  workspace?: Record<string, WorkspaceJson>;
}
export declare function install(opts?: InstallOptions): Promise<Manager>;
