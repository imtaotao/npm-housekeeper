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
      // '' 等于 '*'
      requested = getVersionInfo(requested || "*");
    } catch (err: any) {
      // 如果暂时有不支持的规范，直接报错
      if (requestor) {
        err.dependency = child.name;
        err.requested = requested;
        requestor.errors.push(err);
      }
      return false;
    }
  }

  // 如果有手动写的，就可能有这种情况
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
    // 其余的情况到 version 去校验
    case "version":
      // 如果它是一个版本或一个除 '*' 以外的范围
      return semver.satisfies(child.version, requested.fetchSpec, true);
    case "tag":
      // 如果它是一个标签，我们只需验证它是否有一个 tarball
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
