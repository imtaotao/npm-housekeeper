import { getVersionInfo, gpi } from "gpi";
import * as semver from "esm-semver";

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P
      ? value
      : new P(function (resolve) {
          resolve(value);
        });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done
        ? resolve(result.value)
        : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

const valid = (child, requested, requestor) => {
  if (typeof requested === "string") {
    try {
      // '' => '*'
      requested = getVersionInfo(requested || "*");
    } catch (err) {
      // If there are temporarily unsupported specifications,
      // directly report an error
      if (requestor) {
        requestor.errors.push(err);
      }
      return false;
    }
  }
  if (!requested) {
    if (requestor) {
      requestor.errors.push(new Error("Invalid dependency specifier"));
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
  }
  if (requestor) {
    requestor.errors.push(new Error("Unsupported dependency type"));
  }
  return false;
};
const depValid = (child, requested, accept, requestor) => {
  return (
    valid(child, requested, requestor) ||
    (typeof accept === "string" ? valid(child, accept, requestor) : false)
  );
};

const wf = "workspace:";
const isWs = (spec) => spec.startsWith(wf);
const getWsWanted = (spec) => spec.slice(wf.length);
const isEmptyObject = (obj) => {
  for (const _k in obj) return false;
  return true;
};
const getDepPropByEdgeType = (edgeType, isGet) => {
  if (edgeType === "prod") return "dependencies";
  if (edgeType === "dev") return "devDependencies";
  if (edgeType === "optional") return "optionalDependencies";
  if (edgeType === "peer") return "peerDependencies";
  if (edgeType === "peerOptional") {
    return isGet ? "peerDependencies" : "peerDependenciesMeta";
  }
  throw new TypeError(`Invalid edge type "${edgeType}"`);
};
const jsonCache = new Map();
const formatLockfileData = (lockfileData) => {
  if (typeof lockfileData === "string") {
    if (!jsonCache.has(lockfileData)) {
      jsonCache.set(lockfileData, JSON.parse(lockfileData));
    }
    return jsonCache.get(lockfileData);
  }
  return lockfileData;
};
const cache = Object.create(null);
const parseResolutionKey = (key) => {
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
const formatResolutions = (resolutions) => {
  const obj = Object.create(null);
  for (const key in resolutions) {
    const { parentName, depName } = parseResolutionKey(key);
    if (!obj[parentName]) obj[parentName] = Object.create(null);
    obj[parentName][depName] = {
      raw: key,
      wanted: resolutions[key],
    };
  }
  return obj;
};

const getWorkspaceParent = (node, state) => {
  if (node.isWorkspace()) return node;
  state.add(node);
  for (const edge of node.usedEdges) {
    // If there is a loop, it means that there is a circular dependency,
    // and we only need to judge other nodes
    if (!state.has(edge.parentNode)) {
      const p = getWorkspaceParent(edge.parentNode, state);
      if (p) return p;
    }
  }
  return null;
};
function cropEmptyNodes(manager) {
  const cache = new WeakMap();
  const isEmptyNode = (node) => {
    if (!cache.has(node)) {
      if (node.usedEdges.size === 0) {
        cache.set(node, true);
      } else {
        // As long as the current node is used by the workspace node,
        // it needs to stay
        cache.set(node, !getWorkspaceParent(node, new WeakSet()));
      }
    }
    return cache.get(node);
  };
  for (const name in manager.packages) {
    const pkgs = manager.packages[name];
    for (const version in pkgs) {
      const node = pkgs[version];
      if (isEmptyNode(node)) {
        delete manager.packages[name][version];
      }
    }
    if (isEmptyObject(pkgs)) {
      delete manager.packages[name];
    }
  }
}

class Node {
  constructor(opts) {
    this.usedEdges = new Set();
    this.errors = [];
    this.edges = Object.create(null);
    this.pkg = opts.pkgJson;
    this.name = opts.pkgJson.name;
    this.version = opts.pkgJson.version;
    this.type = opts.type;
    this.hasBin = opts.hasBin;
    this.manager = opts.manager;
    this.resolved = opts.resolved;
    this.integrity = opts.integrity;
    this.legacyPeerDeps = opts.legacyPeerDeps;
  }
  isWorkspace() {
    return this.type === "workspace";
  }
  isOptionalEdge(edgeType) {
    return edgeType === "optional" || edgeType === "peerOptional";
  }
  hasError() {
    return this.errors.length > 0;
  }
  logErrors() {
    for (let e of this.errors) {
      if (typeof e === "string") {
        e = `(${this.name}): ${e}`;
      } else if (e instanceof Error) {
        try {
          e.message = `(${this.name}): ${e.message}`;
        } catch (e) {}
      }
      console.error(e);
    }
  }
  add(name, version = "latest", edgeType = "prod", force) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!force && !this.isWorkspace()) {
        throw new Error("Only add dependencies to the workspace node");
      }
      const resolution = this.manager.tryGetResolution(this.name, name);
      const accept = (this.pkg.acceptDependencies || {})[name];
      const nodeOrErr = yield this.loadSingleDepType(
        name,
        edgeType,
        version,
        resolution,
        accept
      );
      if (!nodeOrErr || nodeOrErr instanceof Node) {
        const prop = getDepPropByEdgeType(edgeType, true);
        if (!this.pkg[prop]) this.pkg[prop] = Object.create(null);
        this.pkg[prop][name] = version;
        this.manager.prune();
        return nodeOrErr;
      } else {
        throw nodeOrErr;
      }
    });
  }
  // TODO: et all the package information first,
  // and then traverse the generation node synchronously
  loadDeps() {
    const ls = [];
    const {
      dependencies,
      devDependencies,
      optionalDependencies,
      peerDependencies: pd,
    } = this.pkg;
    // install peerDependencies
    if (pd && !this.legacyPeerDeps) {
      const pm = this.pkg.peerDependenciesMeta || {};
      const peerOptional = {};
      const peerDependencies = {};
      for (const [name, dep] of Object.entries(pd)) {
        if (pm[name] && pm[name].optional) {
          peerOptional[name] = dep;
        } else {
          peerDependencies[name] = dep;
        }
      }
      ls.push(this.loadDepType(peerDependencies, "peer"));
      ls.push(this.loadDepType(peerOptional, "peerOptional"));
    }
    // Install other dependencies
    ls.push(this.loadDepType(dependencies, "prod"));
    ls.push(this.loadDepType(optionalDependencies, "optional"));
    // Only `workspaceNode` require devDependencies to be installed
    if (this.isWorkspace()) {
      ls.push(this.loadDepType(devDependencies, "dev"));
    }
    return Promise.all(ls);
  }
  loadDepType(deps, edgeType) {
    if (!deps) return;
    const ls = [];
    const ad = this.pkg.acceptDependencies || {};
    for (let [name, wanted] of Object.entries(deps)) {
      if (!name || this.edges[name]) continue;
      // Handling resolutions
      const resolution = this.manager.tryGetResolution(this.name, name);
      const accept = ad[name];
      if (typeof this.manager.opts.filter === "function") {
        if (this.manager.opts.filter(name, resolution || wanted, edgeType)) {
          this.edges[name] = this.createEdge(
            name,
            wanted,
            resolution,
            edgeType,
            accept
          );
          continue;
        }
      }
      ls.push(
        this.loadSingleDepType(name, edgeType, wanted, resolution, accept)
      );
    }
    return Promise.all(ls);
  }
  // This will force an update of the edge nodes
  loadSingleDepType(name, edgeType, wanted, resolution, accept) {
    return __awaiter(this, void 0, void 0, function* () {
      const finalWanted = resolution || wanted;
      const useWs = isWs(finalWanted);
      if (useWs && !this.isWorkspace()) {
        const e = new Error(`Only workspace nodes can use "${wf}"`);
        this.errors.push(e);
        return e;
      }
      // Placeholder (may be an empty object if optional)
      this.edges[name] = Object.create(null);
      const node = this.manager.tryGetReusableNode(
        name,
        finalWanted,
        this,
        accept
      );
      if (node) {
        this.edges[name] = this.createEdge(
          name,
          wanted,
          resolution,
          edgeType,
          accept,
          node
        );
        node.usedEdges.add(this.edges[name]);
        return node;
      } else if (useWs) {
        const e = new Error(
          `There are no available "${name}" nodes in workspace`
        );
        this.errors.push(e);
        return e;
      } else {
        try {
          const version = this.tryGetVersionInWorkspace(
            name,
            finalWanted,
            edgeType
          );
          const searchWanted = version === null ? finalWanted : version;
          const node = yield this.manager.createNode(name, searchWanted);
          this.edges[name] = this.createEdge(
            name,
            wanted,
            resolution,
            edgeType,
            accept,
            node
          );
          node.usedEdges.add(this.edges[name]);
          this.manager.setReusableNode(node);
          // The child node also has to load his own dependencies
          yield node.loadDeps();
          return node;
        } catch (e) {
          delete this.edges[name];
          // If optional, allow errors to occur
          if (this.isOptionalEdge(edgeType)) {
            return null;
          } else {
            this.errors.push(e);
            return e;
          }
        }
      }
    });
  }
  tryGetVersionInWorkspace(name, wanted, edgeType) {
    if (!this.isWorkspace()) return null;
    return this.manager.lockfile.tryGetEdgeVersion(
      this.name,
      name,
      wanted,
      edgeType
    );
  }
  createEdge(name, wanted, resolution, edgeType, accept, node) {
    const edge = Object.create(null);
    edge.node = node;
    edge.name = name;
    edge.type = edgeType;
    edge.accept = accept;
    edge.wanted = wanted;
    edge.parentNode = this;
    edge.resolution = resolution;
    edge.ws = isWs(wanted);
    // All are links, we are mimicking the behavior of pnpm
    edge.link = true;
    return edge;
  }
}

class Manager {
  constructor(opts) {
    this.opts = opts;
    this.workspace = Object.create(null);
    this.packages = Object.create(null);
    this.manifests = new Map(); // { react: { '1.0.0': Node } }
    this.resolutions = formatResolutions(opts.resolutions);
  }
  get lockfile() {
    return this.opts.lockfile;
  }
  // For the generated nodes,
  // some of them may be replaced by the current node,
  // and the same one should be reused as much as possible
  tryReplace(target) {
    if (target.isWorkspace()) return;
    const nodes = this.packages[target.name];
    if (!nodes) return;
    for (const version in nodes) {
      const node = nodes[version];
      if (node === target) continue;
      for (const edge of node.usedEdges) {
        if (
          target.version === node.version ||
          this.satisfiedBy(target, edge.wanted, null, edge.accept)
        ) {
          edge.node = target;
          target.usedEdges.add(edge);
          node.usedEdges.delete(edge);
        }
      }
    }
  }
  prune() {
    cropEmptyNodes(this);
  }
  fetchManifest(name, wanted) {
    const spec = `${name}@${wanted}`;
    if (this.manifests.has(spec)) {
      return this.manifests.get(spec);
    } else {
      const { retry, registry, customFetch } = this.opts;
      const p = gpi(name, wanted, { retry, registry, customFetch }).then(
        (mani) => {
          this.manifests.set(spec, mani);
          return mani;
        }
      );
      this.manifests.set(spec, p);
      return p;
    }
  }
  get(name) {
    return this.workspace[name] || null;
  }
  each(callback) {
    let cbRes = true;
    let i = -1;
    const pKeys = Object.keys(this.packages).sort();
    while (++i < pKeys.length) {
      const name = pKeys[i];
      // Need to be sorted, high version is preferred
      const vKeys = Object.keys(this.packages[name]).sort();
      let j = vKeys.length;
      while (~--j) {
        const version = vKeys[j];
        cbRes = callback(name, version, this.packages[name][version]);
        if (cbRes === false) break;
      }
      if (cbRes === false) break;
    }
  }
  hasError() {
    for (const k in this.workspace) {
      if (this.workspace[k].hasError()) {
        return true;
      }
    }
    let e = false;
    this.each((_n, _v, node) => {
      if (node.hasError()) {
        e = true;
        return false;
      }
    });
    return e;
  }
  logError() {
    for (const k in this.workspace) {
      this.workspace[k].logErrors();
    }
    this.each((_n, _v, node) => node.logErrors());
  }
  // accept: '' => '*'
  satisfiedBy(node, wanted, from, accept) {
    if (accept !== undefined) accept = accept || "*";
    return depValid(node, wanted, accept, from);
  }
  tryGetResolution(parentName, depName) {
    const parent = this.resolutions[parentName] || this.resolutions["**"];
    if (!parent || !parent[depName]) return null;
    return parent[depName].wanted;
  }
  tryGetReusableNode(name, wanted, from, accept) {
    if (isWs(wanted)) {
      wanted = getWsWanted(wanted);
      const node = this.workspace[name];
      if (node) {
        if (this.satisfiedBy(node, wanted, from, accept)) {
          return node;
        }
      }
    } else {
      const nodes = this.packages[name];
      if (nodes) {
        for (const version in nodes) {
          const node = nodes[version];
          if (this.satisfiedBy(node, wanted, from, accept)) {
            return node;
          }
        }
      }
    }
    return null;
  }
  setReusableNode(node) {
    if (node.isWorkspace()) {
      this.workspace[node.name] = node;
    } else {
      if (!this.packages[node.name]) {
        this.packages[node.name] = Object.create(null);
      }
      this.tryReplace(node);
      this.packages[node.name][node.version] = node;
    }
  }
  createNode(name, wanted) {
    return __awaiter(this, void 0, void 0, function* () {
      let pkgJson;
      let hasBin;
      let resolved;
      let integrity;
      const lockInfo = this.lockfile.tryGetNodeManifest(name, wanted);
      if (lockInfo) {
        pkgJson = lockInfo;
        resolved = lockInfo.resolved;
        integrity = lockInfo.integrity;
        hasBin = Boolean(lockInfo.hasBin);
      } else {
        pkgJson = yield this.fetchManifest(name, wanted);
        resolved = pkgJson.dist.tarball;
        integrity = pkgJson.dist.integrity;
        hasBin = Boolean(pkgJson.bin);
      }
      return new Node({
        hasBin,
        pkgJson,
        resolved,
        integrity,
        manager: this,
        type: "package",
        legacyPeerDeps: this.opts.legacyPeerDeps,
      });
    });
  }
  createWorkspaceNode(pkgJson) {
    return new Node({
      integrity: "",
      manager: this,
      type: "workspace",
      hasBin: Boolean(pkgJson.bin),
      resolved: pkgJson.resolved || "",
      legacyPeerDeps: this.opts.legacyPeerDeps,
      pkgJson: pkgJson,
    });
  }
}

class Lockfile {
  constructor(opts) {
    this.version = "1";
    this.managerGetter = opts.managerGetter;
    this.set(opts.json);
  }
  canUse(json) {
    if (!json || typeof json !== "object") return false;
    if (json.lockfileVersion !== this.version) return false;
    for (const p of ["importers", "packages"]) {
      if (!json[p] || typeof json[p] !== "object") return false;
    }
    return true;
  }
  recordDeps(targetNode, obj, isImport) {
    const missEdges = new Set();
    for (const key in targetNode.edges) {
      const { ws, node, type, name, wanted } = targetNode.edges[key];
      // A dependency specified by `workspace:x` that does not need to be documented in the lock file.
      // When a package is released in workspace, we assume they have handled the dependent version themselves
      // Perhaps we can provide the api to do it for them.
      if (ws) continue;
      // Record the `wanted` of the project dependency
      if (isImport) {
        let specifiers = obj.specifiers;
        if (!specifiers) {
          specifiers = obj.specifiers = Object.create(null);
        }
        specifiers[name] = wanted;
      }
      const set = (deps) => {
        if (node) {
          deps[name] = node.version;
        } else {
          // If filtered, there may be no node
          deps[name] = wanted;
          missEdges.add(name);
        }
      };
      const prop = getDepPropByEdgeType(type, false);
      if (prop === "peerDependenciesMeta") {
        // Add to `peerDependencies`
        let peerDeps = obj["peerDependencies"];
        if (!peerDeps) peerDeps = obj["peerDependencies"] = Object.create(null);
        if (!peerDeps[name]) set(peerDeps);
        // Record `meta`info
        let peerMeta = obj[prop];
        if (!peerMeta) peerMeta = obj[prop] = Object.create(null);
        if (!peerMeta[name]) peerMeta[name] = Object.create(null);
        peerMeta[name].optional = true;
      } else {
        if (!obj[prop]) obj[prop] = Object.create(null);
        set(obj[prop]);
      }
    }
    const ad = targetNode.pkg.acceptDependencies;
    if (ad && missEdges.size > 0) {
      for (const edgeName of missEdges) {
        const accept = ad[edgeName];
        if (accept !== undefined) {
          if (!obj["acceptDependencies"]) {
            obj["acceptDependencies"] = Object.create(null);
          }
          obj["acceptDependencies"][edgeName] = accept;
        }
      }
    }
  }
  processWorkspaceNode(targetNode, json) {
    if (targetNode.hasError()) {
      console.error('Cannot output "lockData" when an error occurs');
      targetNode.logErrors();
      return true;
    } else {
      const importerValue = (json.importers[targetNode.name] =
        Object.create(null));
      this.recordDeps(targetNode, importerValue, true);
      return false;
    }
  }
  processPackageNodes(manager, json) {
    let error = false;
    manager.each((name, version, targetNode) => {
      if (targetNode.hasError()) {
        console.error('Cannot output "lockData" when an error occurs');
        targetNode.logErrors();
        error = true;
        return false;
      }
      let pkgVersions = json.packages[name];
      if (!pkgVersions) {
        pkgVersions = json.packages[name] = Object.create(null);
      }
      let packageValue = pkgVersions[version];
      if (!packageValue) {
        packageValue = pkgVersions[version] = Object.create(null);
      }
      // Save download address and message summary
      packageValue.resolved = targetNode.resolved;
      packageValue.integrity = targetNode.integrity;
      if (targetNode.hasBin) {
        packageValue.hasBin = targetNode.hasBin;
      }
      this.recordDeps(targetNode, packageValue, false);
    });
    return error;
  }
  tryGetNodeManifest(name, version) {
    if (!this.json || !this.json.packages[name]) return null;
    const data = this.json.packages[name][version];
    if (!data) return null;
    return Object.assign({ name, version }, data);
  }
  tryGetEdgeVersion(pname, name, wanted, edgeType) {
    if (!this.json) return null;
    const lockInfo = this.json.importers[pname];
    if (!lockInfo || !lockInfo.specifiers) return null;
    const oldWanted = lockInfo.specifiers[name];
    if (oldWanted) {
      try {
        if (oldWanted === wanted || semver.eq(oldWanted, wanted)) {
          // If the new dependencies are in pkgJson `dependencies`,
          // and the old ones are in lockfile `DevDependencies`,
          // the current algorithm is not to match
          const lockDep = lockInfo[getDepPropByEdgeType(edgeType, true)];
          if (!lockDep) return null;
          return lockDep[name] || null;
        }
      } catch (e) {
        // `semver` version comparison may report an error
        return null;
      }
    }
    return null;
  }
  set(json) {
    json = formatLockfileData(json);
    if (this.canUse(json)) {
      this.json = json;
      return true;
    }
    return false;
  }
  output() {
    const manager = this.managerGetter();
    const json = Object.create(null);
    json.lockfileVersion = this.version;
    json.importers = Object.create(null);
    json.packages = Object.create(null);
    // If there is an error, the lockfile cannot be generated
    if (this.processPackageNodes(manager, json)) return null;
    for (const [_n, node] of Object.entries(manager.workspace)) {
      if (this.processWorkspaceNode(node, json)) return null;
    }
    return json;
  }
  // Get the packages that need to be added or deleted
  diff(newJson, type = "all", oldJson = this.json) {
    const mark = Object.create(null);
    // prettier-ignore
    const oldPackages = oldJson && this.canUse(oldJson)
            ? oldJson.packages
            : Object.create(null);
    const traverse = (lp, rp) => {
      const set = Object.create(null);
      for (const name in lp) {
        if (lp[name]) {
          for (const version in lp[name]) {
            const spec = `${name}@${version}`;
            if (mark[spec]) continue;
            mark[spec] = true;
            if (!rp[name] || !rp[name][version]) {
              if (!set[name]) set[name] = Object.create(null);
              set[name][version] = lp[name][version];
            }
          }
        }
      }
      return set;
    };
    const add =
      type === "all" || type === "add"
        ? traverse(newJson.packages, oldPackages)
        : {};
    const remove =
      type === "all" || type === "remove"
        ? traverse(oldPackages, newJson.packages)
        : {};
    return { add, remove };
  }
}

function install(opts = {}) {
  return __awaiter(this, void 0, void 0, function* () {
    const lockfile = new Lockfile({
      json: opts.lockData,
      managerGetter: () => manager,
    });
    const manager = new Manager({
      lockfile,
      retry: opts.retry,
      filter: opts.filter,
      registry: opts.registry,
      customFetch: opts.customFetch,
      resolutions: opts.resolutions || {},
      legacyPeerDeps: Boolean(opts.legacyPeerDeps),
    });
    if (opts.workspace) {
      for (const [name, pkg] of Object.entries(opts.workspace)) {
        pkg.name = name;
        if (!pkg.version) pkg.version = "*";
        const node = manager.createWorkspaceNode(pkg);
        manager.setReusableNode(node);
      }
      yield Promise.all(
        Object.entries(manager.workspace).map(([k, n]) => n.loadDeps())
      );
    }
    manager.prune();
    return manager;
  });
}

export { install };
