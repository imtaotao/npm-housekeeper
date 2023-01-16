// 当有一个 wanted 有多个可以复用的包版本时的几个原则
// 1. 选择复用次数多的，尽量保证复用同一份
// 2. 当有次数一样的包时，选择高版本的
// 这样的前提是，需要同步的进行，这会导致 fetch 资源是一个一个进行的，会很慢。
// 可以选择的方向是
// 1. 提前 fetch 所有的包信息
// 2. 然后重新遍历一遍，生成最终的 data

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
