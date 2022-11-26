import type { EdgeType } from "./node";

export const isEmptyObject = (obj: Record<string, any>) => {
  for (const _k in obj) return false;
  return true;
};

export const wt = "workspace:";
export const isWs = (spec: string) => spec.startsWith(wt);
export const getWsWanted = (spec: string) => spec.slice(wt.length);

export const getDepPropByEdgeType = (edgeType: EdgeType, isGet: boolean) => {
  if (edgeType === "prod") return "dependencies";
  if (edgeType === "dev") return "devDependencies";
  if (edgeType === "optional") return "optionalDependencies";
  if (edgeType === "peer") return "peerDependencies";
  if (edgeType === "peerOptional") {
    return isGet ? "peerDependencies" : "peerDependenciesMeta";
  }
  throw new TypeError(`Invalid edge type "${edgeType}"`);
};
