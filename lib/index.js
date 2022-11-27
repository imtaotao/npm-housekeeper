const fs = require("fs");
const path = require("path");
const config = require("./config");
const { install } = require("../dist/housekeeper.cjs");
// const { simpleFetch } = require("./utils");
const simpleFetch = require('node-fetch');

exports.Installer = class Installer {
  constructor(opts = {}) {
    if (!opts.baseDir) {
      this.registry = opts.registry;
      this.baseDir = opts.baseDir || process.cwd();
      this.rootName = opts.rootName || config.rootName;
      this.lockName = opts.lockName || config.lockName;
      this.globalName = opts.globalName || config.globalName;
      this.modulesName = opts.modulesName || config.modulesName;
    }
    this.opts = opts;
  }

  modulesDir(spec) {
    return path.resolve(
      this.baseDir,
      this.modulesName,
      config.globalName,
      spec
    );
  }

  setLock(data) {
    const lockDir = path.resolve(this.baseDir, `./${this.lockName}.json`);
    fs.writeFileSync(lockDir, JSON.stringify(data, null, 2));
  }

  getLock() {
    const lockDir = path.resolve(this.baseDir, `./${this.lockName}.json`);
    if (fs.existsSync(lockDir)) {
      return JSON.parse(fs.readFileSync(lockDir, "utf-8"));
    }
    return null;
  }

  getWorkspace() {
    const pkgJson = require(path.resolve(this.baseDir, "./package.json"));
    pkgJson.name = this.rootName;
    pkgJson.resolved = this.baseDir;
    const workspace = { [pkgJson.name]: pkgJson };

    for (let dir of pkgJson.workspace || []) {
      dir = path.resolve(this.baseDir, dir);
      const json = require(path.resolve(dir, "./package.json"));
      if (!json.name) throw new Error(`"${dir}" missing package name`);
      if (workspace[json.name]) {
        throw new Error(`"${json.name}" already exists, error from "${dir}"`);
      }
      json.resolved = dir;
      workspace[json.name] = json;
    }
    return workspace;
  }

  checkModulesFolder(workspace) {
    for (const name in workspace) {
      const json = workspace[name];
      const dir = path.resolve(json.resolved, this.modulesName);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      if (name === this.rootName) {
        const globalDir = path.resolve(dir, this.globalName);
        if (!fs.existsSync(globalDir)) {
          fs.mkdirSync(globalDir);
        }
      }
    }
  }

  setupLinks(manager) {
    // TODO:
  }

  async download(resolved, outputDir) {
    console.log(resolved, outputDir);
    // TODO: ...
  }

  GeneratePackages({ add, remove }) {
    const each = (packages, cb) => {
      const ls = [];
      for (const name in packages) {
        for (const version in packages[name]) {
          const dir = this.modulesDir(`${name}@${version}`);
          const { resolved } = packages[name][version];
          if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
          }
          cb && ls.push(cb(resolved, dir));
        }
      }
      return ls;
    };
    // delete
    each(remove);
    // add
    const ls = each(add, this.download);
    return Promise.all(ls);
  }

  async start() {
    const workspace = this.getWorkspace();
    const manager = await install({
      workspace,
      registry: this.registry,
      customFetch: simpleFetch,
      lockData: this.getLock(),
    });
    if (manager.hasError()) {
      manager.logError();
      return false;
    }
    const lockData = manager.lockfile.output();
    const diffData = manager.lockfile.diff(lockData);

    this.checkModulesFolder(workspace);
    await this.GeneratePackages(diffData);
    this.setupLinks(manager);
    // this.lockSet(lockData);
    return true;
  }
};
