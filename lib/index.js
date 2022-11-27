const fs = require("fs");
const path = require("path");
const { install } = require("../dist/housekeeper.cjs");
const { lock, httpClient, simpleFetch } = require("./utils");
const { rootName, globalName, modulesName } = require("./config");

const initWorkspacePkgs = (rootDir) => {
  const pkgJson = require(path.resolve(rootDir, "./package.json"));
  pkgJson.name = rootName;
  pkgJson.resolved = rootDir;
  const workspace = { [pkgJson.name]: pkgJson };

  for (let dir of pkgJson.workspace || []) {
    dir = path.resolve(rootDir, dir);
    const json = require(path.resolve(dir, "./package.json"));
    if (!json.name) throw new Error(`"${dir}" missing package name`);
    if (workspace[json.name]) {
      throw new Error(`"${json.name}" already exists, error from "${dir}"`);
    }
    json.resolved = dir;
    workspace[json.name] = json;
  }
  return workspace;
};

const initNodeModulesFolder = (workspace) => {
  for (const name in workspace) {
    const json = workspace[name];
    const dir = path.resolve(json.resolved, modulesName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    if (name === rootName) {
      const globalDir = path.resolve(dir, globalName);
      if (!fs.existsSync(globalDir)) {
        fs.mkdirSync(globalDir);
      }
    }
  }
};

const downloadPackage = async (resolved, outputDir) => {
  const client = httpClient(resolved);
  // TODO: ...
  console.log(resolved, outputDir);
};

const download = (rootDir, { add, remove }) => {
  const modulesDir = (spec) =>
    path.resolve(rootDir, modulesName, globalName, spec);
  const each = (packages, cb) => {
    const ls = [];
    for (const name in packages) {
      for (const version in packages[name]) {
        const dir = modulesDir(`${name}@${version}`);
        const { resolved } = packages[name][version];
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
        cb && ls.push(cb(resolved, dir));
      }
    }
    return ls;
  };
  each(remove); // delete
  const ls = each(add, downloadPackage); // add
  return Promise.all(ls);
};

const linkPackages = (manager) => {
  // TODO: ...
};

exports.install = (registry, baseDir) => {
  baseDir = baseDir || process.cwd();
  console.log("Dependency analysis in progress...");
  const workspace = initWorkspacePkgs(baseDir);

  install({
    workspace,
    registry,
    customFetch: simpleFetch,
    lockData: lock.get(baseDir),
  }).then(async (manager) => {
    if (manager.hasError()) {
      manager.logError();
    } else {
      const lockData = manager.lockfile.output();
      const diffData = manager.lockfile.diff(lockData);

      console.log("Dependent download in progress...");
      initNodeModulesFolder(workspace);
      await download(baseDir, diffData);
      linkPackages(manager);
      // lock.set(baseDir, lockData);
      console.log("done.");
    }
  });
};

exports.install();
