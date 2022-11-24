import type { EdgeType } from "./node";

export const getDepNameByEdgeType = (type: EdgeType, isGet: boolean) => {
  if (type === "prod") return "dependencies";
  if (type === "dev") return "devDependencies";
  if (type === "optional") return "optionalDependencies";
  if (type === "peer") return "peerDependencies";
  if (type === "peerOptional") {
    return isGet ? "peerDependencies" : "peerDependenciesMeta";
  }
  throw new TypeError(`Invalid edge type "${type}"`);
};
