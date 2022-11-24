import type { Node } from "./node";
import type { Manager } from "./manager";

const cache = new WeakMap<Node, boolean>();

const getTopParent = (parentNode: Node, state: WeakSet<Node>): Node | null => {
  if (state.has(parentNode)) return null;
  if (parentNode.isTop()) return parentNode;
  state.add(parentNode);
  for (const edge of parentNode.usedEdges) {
    const topNode = getTopParent(edge.parentNode, state);
    if (topNode) return topNode;
  }
  return null;
};

const isEmptyNode = (node: Node) => {
  if (!cache.has(node)) {
    if (node.usedEdges.size === 0) {
      cache.set(node, true);
    } else {
      // 只要当前这个 node 被项目所依赖，就需要留下来
      cache.set(node, !getTopParent(node, new WeakSet()));
    }
  }
  return cache.get(node);
};

export function cropEmptyPkg(manager: Manager) {
  manager.each((name, version, node) => {
    if (isEmptyNode(node)) {
      delete manager.packages[name][version];
    }
  });
}
