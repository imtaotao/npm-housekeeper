import { formatLockfileData } from "./utils";
import type { LockfileJson } from "./lockfile";

export function rslEqual(
  resolutions: Record<string, string> = Object.create(null),
  lockfileData?: LockfileJson | string | null
) {
  lockfileData = formatLockfileData(lockfileData);
  const lockResolutions =
    (lockfileData && lockfileData.resolutions) || Object.create(null);
  const rslKeys = Object.keys(resolutions);
  const lockRslKeys = Object.keys(lockResolutions);

  if (rslKeys.length !== lockRslKeys.length) {
    return false;
  }
  for (const key of rslKeys) {
    const wanted = resolutions[key];
    if (!(`${key}@${wanted}` in lockResolutions)) {
      return false;
    }
  }
  return true;
}
