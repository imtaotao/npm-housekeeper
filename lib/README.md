Api for use in `nodeJs`

```js
const path = require("path");
const { Installer } = require('npm-housekeeper/lib');

new Installer({
  // Default value is `path.resolve(os.homedir(), ".housekeeper")`
  cacheDir: path.resolve(process.cwd(), "./_node_modules/.cache/housekeeper"),
})
  .startInstall()
  .then(successful => {
    console.log(successful);
  });
```