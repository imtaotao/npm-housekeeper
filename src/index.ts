import type { RootPkgJson } from "./node";
import { Manager, FilterType } from "./manager";
import { cropEmptyNodes } from "./cropPkgs";
import { Lockfile, LockfileJson } from "./lockfile";

export interface InstallOptions {
  registry?: string;
  filter?: FilterType;
  pkgJson?: RootPkgJson;
  legacyPeerDeps?: boolean;
  customFetch?: typeof fetch;
  lockData?: LockfileJson | string;
}

export async function install(opts: InstallOptions = {}) {
  const lockfile: Lockfile = new Lockfile({
    json: opts.lockData,
    rootNodeGetter: () => node,
  });

  const manager = new Manager({
    lockfile,
    filter: opts.filter,
    registry: opts.registry,
    customFetch: opts.customFetch,
    legacyPeerDeps: Boolean(opts.legacyPeerDeps),
  });

  const node = manager.createRootNode(opts.pkgJson, opts.pkgJson?.workspace);

  const ls = [];
  ls.push(node.loadDeps());
  if (node.workspace) {
    for (const key in node.workspace) {
      ls.push(node.workspace[key].loadDeps());
    }
  }
  await Promise.all(ls);
  cropEmptyNodes(manager);

  return { node, manager, lockfile };
}
