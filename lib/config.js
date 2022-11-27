const os = require("os");
const path = require("path");

module.exports = {
  rootName: ".",
  lockName: "lockData",
  globalName: ".packages",
  modulesName: "node_modules",
  cacheDir: path.resolve(os.homedir(), ".housekeeper"),
};
