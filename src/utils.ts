import type { EdgeType } from "./node";

export const wf = "workspace:";
export const isWs = (spec: string) => spec.startsWith(wf);
export const getWsWanted = (spec: string) => spec.slice(wf.length);

export const isEmptyObject = (obj: Record<string, any>) => {
  for (const _k in obj) return false;
  return true;
};

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

// `a/b`
// `**/b`
// `b` => `**/b`
type ParseRes = { depName: string; parentName: string };
const cache: Record<string, ParseRes> = Object.create(null);
const parseResolutionKey = (key: string) => {
  if (!cache[key]) {
    const parts = key.split("/");
    let depName = "";
    let parentName = "";
    for (let i = 0; i < parts.length; i++) {
      const cur = parts[i];
      if (!parentName) {
        parentName = cur[0] === "@" ? `${cur}/${parts[++i]}` : cur;
      } else {
        depName += cur;
        if (i !== parts.length - 1) depName += "/";
      }
    }
    if (!depName) {
      depName = parentName;
      parentName = "**";
    }
    cache[key] = { depName, parentName };
  }
  return cache[key];
};

export const formatResolutions = (resolutions: Record<string, string>) => {
  const obj: Record<string, Record<string, string>> = Object.create(null);
  for (const key in resolutions) {
    const { parentName, depName } = parseResolutionKey(key);
    if (!obj[parentName]) obj[parentName] = Object.create(null);
    obj[parentName][depName] = resolutions[key];
  }
  return obj;
};
