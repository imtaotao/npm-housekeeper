import * as semver from "esm-semver";
import { getVersionInfo, VersionInfo } from "gpi";
import type { Node } from "./node";

const valid = (
  child: Node,
  requested: string | VersionInfo,
  requestor: Node | null
) => {
  if (typeof requested === "string") {
    try {
      // '' => '*'
      requested = getVersionInfo(requested || "*");
    } catch (err: any) {
      // If there are temporarily unsupported specifications,
      // directly report an error
      if (requestor) {
        err.dependency = child.name;
        err.requested = requested;
        requestor.errors.push(err);
      }
      return false;
    }
  }

  if (!requested) {
    if (requestor) {
      const err: any = new Error("Invalid dependency specifier");
      err.dependency = child.name;
      err.requested = requested;
      requestor.errors.push(err);
    }
    return false;
  }

  switch (requested.type) {
    case "range":
      if (requested.fetchSpec === "*") {
        return true;
      }
    case "version":
      // If it is a version or a range other than '*'
      return semver.satisfies(child.version, requested.fetchSpec, true);
    case "tag":
      // If it is a tag, we just need to verify that it has a tarball
      return Boolean(child.resolved);
    default:
      break;
  }

  if (requestor) {
    const err: any = new Error("Unsupported dependency type");
    err.dependency = child.name;
    err.requested = requested;
    requestor.errors.push(err);
  }
  return false;
};

export const depValid = (
  child: Node,
  requested: string,
  accept: string | undefined,
  requestor: Node | null
) => {
  return (
    valid(child, requested, requestor) ||
    (typeof accept === "string" ? valid(child, accept, requestor) : false)
  );
};
