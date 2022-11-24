import type { RootPkgJson } from "./node";
import { Manager } from "./manager";
import { cropEmptyPkg } from "./cropPkgs";
import { Lockfile, LockfileJson } from "./lockfile";

export interface InstallOptions {
  pkgJson: RootPkgJson;
  registry?: string;
  legacyPeerDeps?: boolean;
  lockData?: LockfileJson | string;
}

export async function install(opts: InstallOptions) {
  opts.legacyPeerDeps = Boolean(opts.legacyPeerDeps);
  opts.registry = opts.registry || "https://registry.npmjs.org";
  if (!opts.registry.endsWith("/")) opts.registry += "/";

  const list = [];

  // @ts-ignore
  const lockfile = new Lockfile({
    json: opts.lockData,
    registry: opts.registry,
    legacyPeerDeps: opts.legacyPeerDeps,
    rootNodeGetter: () => rootNode,
  });

  // @ts-ignore
  const manager = new Manager({
    lockfile,
    registry: opts.registry,
    legacyPeerDeps: opts.legacyPeerDeps,
  });

  // @ts-ignore
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
  cropEmptyPkg(manager);

  return {
    node: rootNode as Node,
    manager: manager as Manager,
    lockfile: lockfile as Lockfile,
  };
}
