Api for use in `nodeJs`

```js
const path = require("path");
const { Installer } = require('npm-housekeeper/lib');

const options = {
  cacheDir: path.resolve(process.cwd(), "./_node_modules/.cache"),
}

new Installer(options)
  .start()
  .then(successful => {
    console.log(successful);
  });
```