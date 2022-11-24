import { Manager } from "./manager";
import { Lockfile } from "./lockfile";
import { LockfileJson, genLockfile } from "./genLock";
import type { RootPkgJson } from "./node";

export interface InstallOptions {
  pkgJson: RootPkgJson;
  registry?: string;
  legacyPeerDeps?: boolean;
  lockfile?: LockfileJson | string;
}

export async function install(opts: InstallOptions) {
  opts.legacyPeerDeps = Boolean(opts.legacyPeerDeps);
  opts.registry = opts.registry || "https://registry.npmjs.org";
  if (!opts.registry.endsWith("/")) opts.registry += "/";

  const list = [];
  const lockfile = new Lockfile({
    json: opts.lockfile,
    registry: opts.registry,
    legacyPeerDeps: opts.legacyPeerDeps,
  });

  const manager = new Manager({
    lockfile,
    registry: opts.registry,
    legacyPeerDeps: opts.legacyPeerDeps,
  });

  const rootNode = manager.createRootNode(
    opts.pkgJson,
    opts.pkgJson.projects || {}
  );

  list.push(rootNode.loadDeps());
  if (rootNode.projects) {
    for (const key in rootNode.projects) {
      list.push(rootNode.projects[key].loadDeps());
    }
  }
  await Promise.all(list);
  manager.cropEmptyPackages();

  return {
    manager,
    node: rootNode,
    lockfile: () => genLockfile(rootNode),
  };
}
