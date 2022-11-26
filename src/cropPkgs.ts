import type { Node } from "./node";
import type { Manager } from "./manager";
import { isEmptyObject } from "./utils";

const getWorkspaceParent = (node: Node, state: WeakSet<Node>): Node | null => {
  if (node.isWorkspace()) return node;
  state.add(node);
  for (const edge of node.usedEdges) {
    // If there is a loop, it means that there is a circular dependency,
    // and we only need to judge other nodes
    if (!state.has(edge.parentNode)) {
      const p = getWorkspaceParent(edge.parentNode, state);
      if (p) return p;
    }
  }
  return null;
};

export function cropEmptyNodes(manager: Manager) {
  const cache = new WeakMap<Node, boolean>();

  const isEmptyNode = (node: Node) => {
    if (!cache.has(node)) {
      if (node.usedEdges.size === 0) {
        cache.set(node, true);
      } else {
        // As long as the current node is used by the workspace node,
        // it needs to stay
        cache.set(node, !getWorkspaceParent(node, new WeakSet()));
      }
    }
    return cache.get(node);
  };

  for (const name in manager.packages) {
    const pkgs = manager.packages[name];
    for (const version in pkgs) {
      const node = pkgs[version];
      if (isEmptyNode(node)) {
        delete manager.packages[name][version];
      }
    }
    if (isEmptyObject(pkgs)) {
      delete manager.packages[name];
    }
  }
}
