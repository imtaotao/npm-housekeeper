const fs = require("fs");
const { install, rslEqual } = require("../dist/housekeeper.cjs");

globalThis.isNodeEnv = true;
globalThis.install = install;
globalThis.rslEqual = rslEqual;
globalThis.fetch = require("node-fetch");
globalThis.localStorage = {
  setItem(name, data) {
    fs.writeFileSync(`./${name}.json`, data);
  },

  getItem(name) {
    if (fs.existsSync(`./${name}.json`)) {
      return JSON.parse(fs.readFileSync(`./${name}.json`, "utf-8"));
    }
    return null;
  },
};

// Execute test logic
require("./test");
