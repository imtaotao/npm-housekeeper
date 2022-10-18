import { gpi } from "gpi";
import { Node, PackageJson } from "./node";
import { stringLocaleCompare } from "./localCompare";

const localeCompare = stringLocaleCompare("en");

export interface BuildTreeOptions {
  registry?: string;
  legacyPeerDeps?: boolean;
}

// 根据 package.json 和 lockfile 构建出一颗理想的树
export class IdealTreeBuilder {
  registry: string;
  legacyPeerDeps: boolean;
  depsSeen = new Set<Node>();
  depsQueue: Array<Node> = [];
  idealTree?: Node;
  currentDep?: Node;

  constructor(opts: BuildTreeOptions = {}) {
    this.legacyPeerDeps = opts.legacyPeerDeps || false;
    this.registry = opts.registry || "https://registry.npmjs.org";
    if (!this.registry.endsWith("/")) this.registry += "/";
  }

  async build(pkg: PackageJson) {
    this.idealTree = this.rootNodeFromPackage(pkg);
    this.depsQueue.push(this.idealTree);
    this.buildDepStep();
  }

  private buildDepStep(): void {
    if (!this.depsQueue.length) return;
    // 将较浅的排序到前面，因为他会影响到更深的层次，然后根据路径排序
    this.depsQueue.sort(
      (a, b) => a.depth - b.depth || localeCompare(a.location, b.location)
    );
    const node = this.depsQueue.shift()!;
    if (
      this.depsSeen.has(node) ||
      node.root !== this.idealTree /* || lockfile 的判断*/
    ) {
      return this.buildDepStep();
    }
    this.depsSeen.add(node);
    this.currentDep = node;

    console.log(node);
  }

  private nodeFromSpec(name: string, spec: string, parent: Node) {}

  private rootNodeFromPackage(pkg: PackageJson) {
    const root = new Node({
      pkg,
      location: "",
      parent: null,
      root: null,
      dev: false,
      devOptional: false,
      peer: false,
      optional: false,
      legacyPeerDeps: this.legacyPeerDeps,
    });
    root.root = root;
    return root;
  }
}
