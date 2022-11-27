const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { install } = require("./dist/housekeeper.cjs");

const rootName = ".";
const globalName = ".ps";
const lockDataName = "lockData";
const modulesName = "_node_modules";

const getHttpClient = (url) => (url.startsWith("https:") ? https : http);

const lock = {
  set(rootDir, data) {
    const lockDir = path.resolve(rootDir, `./${lockDataName}.json`);
    fs.writeFileSync(lockDir, JSON.stringify(data, null, 2));
  },

  get(rootDir) {
    const lockDir = path.resolve(rootDir, `./${lockDataName}.json`);
    if (fs.existsSync(lockDir)) {
      return JSON.parse(fs.readFileSync(lockDir, "utf-8"));
    }
    return null;
  },
};

// For `gpi` use only
const simpleFetch = (url, opts) => {
  return new Promise((resolve, reject) => {
    getHttpClient(url)
      .get(url, { headers: opts?.headers }, (res) => {
        const { statusCode } = res;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
          res.resume();
          // Consume response data to free up memory
          const error = new Error(
            "Request Failed.\n" + `Status Code: ${statusCode}`
          );
          error.code = statusCode;
          reject(error);
        } else {
          res.setEncoding("utf8");
          let rawData = "";
          res.on("data", (chunk) => (rawData += chunk));
          res.on("end", () => {
            const headers = new Map();
            for (const k in res.headers) {
              headers.set(k, res.headers[k]);
            }
            resolve({
              headers,
              code: statusCode,
              json: async () => JSON.parse(rawData),
            });
          });
        }
      })
      .on("error", (e) => reject(e));
  });
};

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
  const client = getHttpClient(resolved);
  client.get(resolved, res => {
    // ...
  })
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
