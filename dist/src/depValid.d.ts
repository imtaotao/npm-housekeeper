import type { Node } from "./node";
export declare const depValid: (
  child: Node,
  requested: string,
  accept: string | undefined,
  requestor: Node | null
) => boolean;
