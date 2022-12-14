import type { RetryType } from "gpi";
import type { NodePkgJson, WorkspaceJson } from "./node";
import { Manager, FilterType } from "./manager";
import { Lockfile, LockfileJson } from "./lockfile";

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

export async function install(opts: InstallOptions = {}) {
  const lockfile: Lockfile = new Lockfile({
    json: opts.lockData,
    managerGetter: () => manager,
  });

  const manager: Manager = new Manager({
    lockfile,
    retry: opts.retry,
    filter: opts.filter,
    registry: opts.registry,
    customFetch: opts.customFetch,
    resolutions: opts.resolutions || {},
    legacyPeerDeps: Boolean(opts.legacyPeerDeps),
  });

  if (opts.workspace) {
    for (const [name, pkg] of Object.entries(opts.workspace)) {
      pkg.name = name;
      if (!pkg.version) pkg.version = "*";
      const node = manager.createWorkspaceNode(pkg as NodePkgJson);
      manager.setReusableNode(node);
    }
    await Promise.all(
      Object.entries(manager.workspace).map(([k, n]) => n.loadDeps())
    );
  }

  manager.prune();
  return manager;
}
