import type { Node } from "./node";
import type { Manager } from "./manager";

// 对于已经下载的 node，里面有一些可能可以被当前这个替代，尽可能复用同一个
// 在生成 edge 的 node 时，已经取了复用的，但是可能有时序问题，这里也要判断一次
export function tryReplace(manager: Manager, target: Node) {
  const nodes = manager.packages[target.name];
  if (!nodes) return;

  for (const version in nodes) {
    const node = nodes[version];
    if (node === target) continue;

    // TODO: 循环依赖的问题现在还没有清除干净
    for (const edge of node.usedEdges) {
      if (manager.satisfiedBy(target, edge.wanted, null, edge.accept)) {
        edge.node = target;
        target.usedEdges.add(edge);
        node.usedEdges.delete(edge);
      }
    }
  }
}
