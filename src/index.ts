import type { RootPkgJson } from "./node";
import { Manager } from "./manager";
import { cropEmptyPkg } from "./cropPkgs";
import { Lockfile, LockfileJson } from "./lockfile";

export interface InstallOptions {
  pkgJson?: RootPkgJson;
  registry?: string;
  legacyPeerDeps?: boolean;
  customFetch?: typeof fetch;
  lockData?: LockfileJson | string;
}

export async function install(opts: InstallOptions) {
  opts.legacyPeerDeps = Boolean(opts.legacyPeerDeps);
  opts.registry = opts.registry || "https://registry.npmjs.org";
  if (!opts.registry.endsWith("/")) opts.registry += "/";

  const lockfile: Lockfile = new Lockfile({
    json: opts.lockData,
    registry: opts.registry,
    rootNodeGetter: () => node,
  });

  const manager = new Manager({
    lockfile,
    registry: opts.registry,
    customFetch: opts.customFetch,
    legacyPeerDeps: opts.legacyPeerDeps,
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
  cropEmptyPkg(manager);

  return { node, manager, lockfile };
}
