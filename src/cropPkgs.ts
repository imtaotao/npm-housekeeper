import type { Node } from "./node";
import type { Manager } from "./manager";

const cache = new WeakMap<Node, boolean>();

const getTopParent = (node: Node, state: WeakSet<Node>): Node | null => {
  if (node.isTop()) return node;
  state.add(node);
  for (const edge of node.usedEdges) {
    // 如果有回环，则代表循环依赖了，判断其他节点即可
    if (!state.has(edge.parentNode)) {
      const topNode = getTopParent(edge.parentNode, state);
      if (topNode) return topNode;
    }
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
