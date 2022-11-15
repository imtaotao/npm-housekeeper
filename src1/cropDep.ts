import type { Node } from "./node";

export class CorpDep {
  private node: Node;

  constructor(node: Node) {
    this.node = node;
  }

  start() {
    return this.node;
  }
}
