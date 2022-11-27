const path = require("path");
const { Installer } = require("../lib");

new Installer({
  cacheDir: path.resolve(process.cwd(), "./node_modules/.cache"),
})
  .startInstall()
  .then((successful) => {
    console.log(successful);
  });
