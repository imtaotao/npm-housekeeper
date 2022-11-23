import type { PackageData } from "gpi";
import { Manager } from "./manager";
import { Lockfile } from "./lockfile";

export type PackageJson = Omit<PackageData, "dist" | "version">;

export interface MonorepoDepsOptions {
  registry?: string;
  legacyPeerDeps?: boolean;
  pkgJson: Partial<PackageJson> & {
    projects?: Array<Partial<PackageJson>>;
  };
}

export async function monorepoDeps(opts: MonorepoDepsOptions) {
  opts.legacyPeerDeps = Boolean(opts.legacyPeerDeps);
  opts.registry = opts.registry || "https://registry.npmjs.org";
  if (!opts.registry.endsWith("/")) opts.registry += "/";

  const list = [];
  const manager = new Manager({
    registry: opts.registry,
    legacyPeerDeps: opts.legacyPeerDeps,
  });
  const rootNode = manager.createRootNode(
    opts.pkgJson as any,
    (opts.pkgJson.projects as any) || []
  );

  list.push(rootNode.loadDeps());
  for (const node of rootNode.projects!) {
    list.push(node.loadDeps());
  }

  await Promise.all(list);
  manager.cropEmptyPackages();

  return {
    manager,
    node: rootNode,
    lockfile: new Lockfile(rootNode, manager),
  };
}
