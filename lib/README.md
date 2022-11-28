Api for use in `nodeJs`

```js
const path = require("path");
const { Installer } = require('npm-housekeeper/lib');

new Installer({
  // Default value is `https://registry.npmjs.org`
  registry: "https://registry.npmjs.org",
  // Default value is `path.resolve(os.homedir(), ".housekeeper")`
  cacheDir: path.resolve(process.cwd(), "./_node_modules/.cache/housekeeper"),
})
  .startInstall()
  .then(successful => {
    console.log(successful);
  });
```