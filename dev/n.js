const fs = require("fs");
const { install } = require("../dist/housekeeper.cjs");

globalThis.isNodeEnv = true;
globalThis.install = install;
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

// 执行测试逻辑
require("./test");
