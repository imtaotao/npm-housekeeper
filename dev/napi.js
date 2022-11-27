const path = require("path");
const { Installer } = require("../lib");

const options = {
  cacheDir: path.resolve(process.cwd(), "./node_modules/.cache"),
};

new Installer(options).start().then((successful) => {
  console.log(successful);
});
