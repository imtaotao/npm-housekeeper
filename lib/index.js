const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const config = require("./config");
const { untar } = require("./untar");
const { install } = require("../dist/housekeeper.umd");
const {
  pathEqual,
  httpClient,
  simpleFetch,
  isSymlinkSync,
} = require("./utils");

exports.Installer = class Installer {
  constructor(opts = {}) {
    this.registry = opts.registry;
    this.baseDir = opts.baseDir || process.cwd();
    this.rootName = opts.rootName || config.rootName;
    this.lockName = opts.lockName || config.lockName;
    this.cacheDir = opts.cacheDir || config.cacheDir;
    this.globalName = opts.globalName || config.globalName;
    this.modulesName = opts.modulesName || config.modulesName;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  modulesDir(spec) {
    return path.resolve(
      this.baseDir,
      this.modulesName,
      config.globalName,
      spec
    );
  }

  lockGet() {
    const lockDir = path.resolve(this.baseDir, `./${this.lockName}.json`);
    if (fs.existsSync(lockDir)) {
      return JSON.parse(fs.readFileSync(lockDir, "utf-8"));
    }
    return null;
  }

  lockSet(data) {
    const lockDir = path.resolve(this.baseDir, `./${this.lockName}.json`);
    fs.writeFileSync(lockDir, JSON.stringify(data, null, 2));
  }

  getWorkspace() {
    const pkgJson = require(path.resolve(this.baseDir, "./package.json"));
    pkgJson.name = this.rootName;
    pkgJson.resolved = this.baseDir;
    const workspace = { [pkgJson.name]: pkgJson };

    for (let dir of pkgJson.workspace || []) {
      if (!path.isAbsolute(dir)) {
        dir = path.resolve(this.baseDir, dir);
      }
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

  checkRootModulesFolder(workspace) {
    for (const name in workspace) {
      if (name === this.rootName) {
        const json = workspace[name];
        const dir = path.resolve(json.resolved, this.modulesName);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        const globalDir = path.resolve(dir, this.globalName);
        if (!fs.existsSync(globalDir)) {
          fs.mkdirSync(globalDir);
        }
        break;
      }
    }
  }

  setupBinScripts(node, edge, targetDir, destDir) {
    if (!edge.node.hasBin) return;
    console.log(edge.name, edge.node.hasBin);
    // TODO: .bin
  }

  setupLinks(manager) {
    const set = (targetDir, destDir, node, edge) => {
      if (fs.existsSync(destDir)) {
        if (
          isSymlinkSync(destDir) &&
          pathEqual(targetDir, fs.realpathSync(destDir))
        ) {
          return;
        }
        fs.rmSync(destDir, { recursive: true, force: true });
      }
      const baseDir = path.dirname(destDir);
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
      fs.symlinkSync(targetDir, destDir);
      this.setupBinScripts(node, edge, targetDir, destDir);
    };

    // packages
    manager.each((name, version, node) => {
      for (const [_n, edge] of Object.entries(node.edges)) {
        if (!edge.node) continue;
        if (edge.node.isWorkspace()) {
          throw new Error("Only workspace node can use other workspace nodes");
        }
        const targetDir = this.modulesDir(`${edge.name}@${edge.node.version}`);
        const destDir = path.resolve(
          this.modulesDir(`${name}@${version}`),
          this.modulesName,
          edge.name
        );
        set(targetDir, destDir, node, edge);
      }
    });

    // workspace
    for (const [_n, node] of Object.entries(manager.workspace)) {
      const moduleDir = path.resolve(node.resolved, this.modulesName);
      for (const [_, edge] of Object.entries(node.edges)) {
        // If there is no node, it means it is filtered
        if (!edge.node) continue;
        const targetDir = edge.node.isWorkspace()
          ? edge.node.resolved
          : this.modulesDir(`${edge.name}@${edge.node.version}`);
        const destDir = path.resolve(moduleDir, edge.name);
        set(targetDir, destDir, node, edge);
      }
    }
  }

  transfer(cacheDir, destDir) {
    return new Promise((resolve, reject) => {
      const decoder = zlib.createGunzip();
      const readable = fs.createReadStream(cacheDir);

      readable.on("error", reject);
      decoder.on("error", reject);
      readable.pipe(decoder);

      let bufs = [];
      decoder.on("data", (chunk) => bufs.push(chunk));
      decoder.on("end", async () => {
        const buffer = Buffer.concat(bufs).buffer;
        const files = await untar(buffer);

        for (const { name, buffer } of files) {
          const parts = name.split("/");
          // Maybe a file (Problems with compression packages)
          if (parts[parts.length - 1] === "") {
            continue;
          }
          const filepath = parts.slice(1).join("/");
          const code = new TextDecoder("utf-8").decode(buffer);
          const fileDir = path.resolve(destDir, filepath);
          const baseDir = path.dirname(fileDir);
          if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
          }
          fs.writeFileSync(fileDir, code);
          resolve();
        }
      });
    });
  }

  download(name, version, resolved, destDir) {
    return new Promise(async (resolve, reject) => {
      const cacheDir = path.resolve(this.cacheDir, `${name}@${version}.tgz`);
      if (fs.existsSync(cacheDir)) {
        this.transfer(cacheDir, destDir).then(resolve, reject);
      } else {
        const baseDir = path.dirname(cacheDir);
        if (!fs.existsSync(baseDir)) {
          fs.mkdirSync(baseDir, { recursive: true });
        }
        httpClient(resolved).get(resolved, (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            // Consume response data to free up memory
            const error = new Error(
              "Request Failed.\n" + `Status Code: ${res.statusCode}`
            );
            reject(error);
          } else {
            const writable = fs.createWriteStream(cacheDir);
            res.pipe(writable);
            res.on("error", reject);
            writable.on("error", reject);
            writable.on("finish", () => {
              this.transfer(cacheDir, destDir).then(resolve, reject);
            });
          }
        });
      }
    });
  }

  generatePackages(addPackages, removePackages) {
    const each = (packages, type, download) => {
      const ls = [];
      for (const name in packages) {
        for (const version in packages[name]) {
          const dir = this.modulesDir(`${name}@${version}`);
          const rmOldPkg = () => {
            if (fs.existsSync(dir)) {
              fs.rmSync(dir, { recursive: true, force: true });
            }
          };
          if (type === "remove") {
            rmOldPkg();
          } else {
            try {
              const jsonDir = path.resolve(dir, "./package.json");
              const pkgJson = JSON.parse(fs.readFileSync(jsonDir, "utf-8"));
              if (name === pkgJson.name && version === pkgJson.version) {
                continue;
              }
            } catch (e) {}

            rmOldPkg();
            const { resolved } = packages[name][version];
            ls.push(download(name, version, resolved, dir));
          }
        }
      }
      return ls;
    };
    each(removePackages, "remove");
    const ls = each(addPackages, "add", this.download.bind(this));
    return Promise.all(ls);
  }

  async startInstall() {
    const workspace = this.getWorkspace();
    const manager = await install({
      workspace,
      registry: this.registry,
      lockData: this.lockGet(),
      customFetch: simpleFetch,
    });
    if (manager.hasError()) {
      manager.logError();
      return false;
    }
    const lockData = manager.lockfile.output();
    const diffData = manager.lockfile.diff(lockData);

    this.checkRootModulesFolder(workspace);
    await this.generatePackages(manager.packages, diffData.remove);
    this.setupLinks(manager);
    this.lockSet(lockData);
    return true;
  }
};
