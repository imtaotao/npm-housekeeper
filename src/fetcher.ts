import { gpi, RetryType, PackageData } from "gpi";
import type { Lockfile } from "./lockfile";

export interface FetcherOptions {
  retry?: RetryType;
  registry?: string;
  lockfile: Lockfile;
  customFetch?: typeof fetch;
}

export class Fetcher {
  constructor(public opts: FetcherOptions) {}

  fetch() {

  }
}