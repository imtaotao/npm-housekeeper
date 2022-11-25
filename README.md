<div align='center'>
<h2>npm-housekeeper</h2>

[![NPM version](https://img.shields.io/npm/v/npm-housekeeper.svg?color=a1b858&label=)](https://www.npmjs.com/package/npm-housekeeper)

</div>

Build an ideal tree through `package.json` (cross-platform, can be used in `browsers`).

[Online test platform](https://imtaotao.github.io/npm-housekeeper/dev/b.html)

### Usage

```js
import { install } from 'npm-housekeeper';

install({
  legacyPeerDeps: false, // default value `false`
  registry: 'https://registry.npmjs.org', // default value `https://registry.npmjs.org` 
  lockData: localStorage.getItem('lockData'), // set lockfile data
  pkgJson: { // default value `{}`
    dependencies: {
      'create-react-app': "*",
      '@arco-design/web-react': '*',
    },
    workspace: {
      p1: {
        dependencies: {
          'vue': '*',
        },
      },
      p2: {
        dependencies: {
          'react': '*',
        },
      },
    },
  },
}).then(async apis => {
  console.log(apis.node); // root node

  // lockData is null when there is an error
  const lockData = apis.lockfile.output();
  console.log(lockData);

   // Save lockfile
  localStorage.setItem('lockData', JSON.stringify(lockData));
})
```


### Other apis

```js
// add other deps
install().then(async apis => {
  // - `version` default is `latest`
  // - `depType` default is `prod`
  const expressNode = await apis.node.add('express', 'latest', 'prod')
  console.log(expressNode);

  // Update lockfile data
  const lockData = apis.lockfile.output();
  localStorage.setItem('lockData', JSON.stringify(lockData));
})

// If an error occurs, log errors
install().then(apis => {
  apis.manager.logErrors();
})

// View all nodes
install().then(apis => {
  console.log(apis.manager.packages);
  apis.manager.each((name, version, node) => {
    ...
  })
})

// Filter some packages
install({
  ...
  filter: (name, wanted) => name.startsWith("@types/"), // Filter `@types/x`
}).then(apis => {
  ...
})
```


### Use in `nodeJs`

```js
// `The first way`: pass in custom `fetch`
install({
  customFetch: require("node-fetch"),
}).then(apis => {
  ...
})

// `The second way`: set the global `fetch`
globalThis.fetch = require("node-fetch");
install().then(apis => {
  ...
})
```


### CDN

```html
<!DOCTYPE html>
<html lang="en">
<body>
  <script src="https://unpkg.com/npm-housekeeper@latest/dist/housekeeper.umd.js"></script>
  <script>
    const { install } = window.Housekeeper;
    // ...
  </script>
</body>
</html>
```
