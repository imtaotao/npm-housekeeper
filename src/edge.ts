import type { Node } from "./node";
import { depValid } from "./depValid";

export type Type = "prod" | "dev" | "peer" | "optional" | "peerOptional";

export interface EdgeOptions {
  type: Type;
  name: string;
  spec: string;
  from: Node;
  accept?: string;
}

export class Edge {
  type: Type;
  to: Node | null;
  from: Node | null;
  name: string;
  spec: string;
  accept?: string;
  peerConflicted = false;
  private errorTag: string | null = null;

  constructor(opts: EdgeOptions) {
    this.to = null;
    this.from = opts.from;
    this.name = opts.name;
    this.type = opts.type;
    this.spec = opts.spec;
    // '' 等于 '*'
    if (opts.accept !== undefined) {
      this.accept = opts.accept || "*";
    }
    this.setFrom(opts.from);
  }

  get prod() {
    return this.type === "prod";
  }

  get dev() {
    return this.type === "dev";
  }

  get optional() {
    return this.type === "optional" || this.type === "peerOptional";
  }

  get peer() {
    return this.type === "peer" || this.type === "peerOptional";
  }

  get valid() {
    return !this.error;
  }

  get missing() {
    return this.error === "MISSING";
  }

  get invalid() {
    return this.error === "INVALID";
  }

  get peerLocal() {
    return this.error === "PEER LOCAL";
  }

  get error() {
    this.errorTag = this.errorTag || this.loadError();
    return this.errorTag === "OK" ? null : this.errorTag;
  }

  setFrom(node: Node) {
    this.from = node;
    if (node.edgesOut.has(this.name)) {
      node.edgesOut.get(this.name)!.detach();
    }
    node.addEdgeOut(this);
    this.reload();
  }

  detach() {
    if (this.to) {
      this.to.edgesIn.delete(this);
    }
    this.from?.edgesOut.delete(this.name);
    this.to = null;
    this.errorTag = "DETACHED";
    this.from = null;
  }

  reload(hard = false) {
    const newTo = this.from ? this.from.resolve(this.name) : null;
    if (newTo !== this.to) {
      if (this.to) {
        this.to.edgesIn.delete(this);
      }
      this.to = newTo;
      this.errorTag = this.loadError();
      if (this.to) {
        this.to.addEdgeIn(this);
      }
    } else if (hard) {
      this.errorTag = this.loadError();
    }
  }

  satisfiedBy(node: Node) {
    if (node.name !== this.name || !this.from) {
      return false;
    }
    return depValid(node, this.spec, this.accept, this.from);
  }

  private loadError() {
    // prettier-ignore
    return !this.to
      ? (this.optional ? null : 'MISSING')
        : this.peer && this.from === this.to.parent && !this.from?.isTop
          ? 'PEER LOCAL'
          : !this.satisfiedBy(this.to)
            ? 'INVALID'
            : 'OK'
  }
}
