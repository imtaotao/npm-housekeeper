import { gpi, PackageData } from "gpi";
import { Node, PackageJson } from "./node";
import { Edge } from "./edge";
import { CorpDep } from "./cropDep";

export interface BuildTreeOptions {
  registry?: string;
  legacyPeerDeps?: boolean;
}

// 根据 package.json 和 lockfile 构建出一颗理想的树
export class IdealTreeBuilder {
  idealNode?: Node;
  registry: string;
  legacyPeerDeps: boolean;
  private depsSeen = new Set<Node>();
  private loadFailures = new Set<Node>();
  private manifests = new Map<string, PackageData | Promise<PackageData>>();

  constructor(opts: BuildTreeOptions = {}) {
    this.legacyPeerDeps = opts.legacyPeerDeps || false;
    this.registry = opts.registry || "https://registry.npmjs.org";
    if (!this.registry.endsWith("/")) this.registry += "/";
  }

  async build(pkg: PackageJson) {
    this.idealNode = this.rootNodeFromPackage(pkg);
    console.log(this.idealNode);
    await this.buildDepStep(this.idealNode);
    // return new CorpDep(this.idealNode).start();
  }

  // 根据 edges 来生成 node
  private async buildDepStep(node: Node) {
    if (this.depsSeen.has(node) || this.loadFailures.has(node)) {
      return;
    }
    this.depsSeen.add(node);
    const ls = [...node.edgesOut.values()].map(async (edge) => {
      const dep = await this.nodeFromSpec(edge.name, edge.spec, node, edge);
      node.children.set(dep.name, dep);
      await this.buildDepStep(dep);
    });
    await Promise.all(ls);
  }

  private async nodeFromSpec(
    name: string,
    wanted: string,
    parent: Node,
    edge: Edge
  ) {
    const prefix = parent.location ? `${parent.location}/` : "";
    try {
      const pkg = await this.fetchManifest(name, wanted);
      return new Node({
        pkg,
        parent,
        legacyPeerDeps: this.legacyPeerDeps,
        location: `${prefix}node_modules/${pkg.name}`,
      });
    } catch (error: any) {
      (error as any).requiredBy = edge.from?.location || ".";
      // 如果有错误，也要记录下来，因为后面要验证，这个可能是可选的包
      const node = new Node({
        parent,
        error,
        pkg: { name, version: "" },
        legacyPeerDeps: this.legacyPeerDeps,
        location: `${prefix}node_modules/${name}`,
      });
      this.loadFailures.add(node);
      return node;
    }
  }

  private rootNodeFromPackage(pkg: PackageJson) {
    const root = new Node({
      pkg,
      location: "",
      parent: null,
      legacyPeerDeps: this.legacyPeerDeps,
    });
    root.root = root;
    return root;
  }

  private fetchManifest(name: string, wanted: string) {
    const spec = `${name}@${wanted}`;
    if (this.manifests.has(spec)) {
      return this.manifests.get(spec)!;
    } else {
      const p = gpi(name, wanted).then((mani) => {
        this.manifests.set(spec, mani);
        return mani;
      });
      this.manifests.set(spec, p);
      return p;
    }
  }
}
