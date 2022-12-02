<div align="center">
<h2>npm-housekeeper</h2>

[![NPM version](https://img.shields.io/npm/v/npm-housekeeper.svg?color=a1b858&label=)](https://www.npmjs.com/package/npm-housekeeper)

</div>

Build an ideal tree through `package.json` (cross-platform, can be used in `browsers`).

[Online test platform](https://imtaotao.github.io/npm-housekeeper/dev/browser.html)

### Usage

```js
import { install } from "npm-housekeeper";

install({
  legacyPeerDeps: false, // Default value `false`
  registry: "https://registry.npmjs.org", // Default value `https://registry.npmjs.org` 
  lockData: localStorage.getItem("lockData"), // Set lockfile data
  workspace: {
    ".": {
      dependencies: {
        "create-react-app": "*",
        "@arco-design/web-react": "*",
      },
    },
    p1: {
      dependencies: {
        "p2": "workspce:*", // Specify other package in workspace
        "vue": "*",
      },
    },
    p2: {
      dependencies: {
        "react": "*",
      },
    },
  },
}).then(manager => {
  if (manager.hasError()) {
    manager.logError();
  } else {
    // `lockData` is null when there is an error
    const lockData = manager.lockfile.output();
    console.log(lockData);
    // Save lockfile
    localStorage.setItem("lockData", JSON.stringify(lockData));
  }
})
```


### resolutions

`resolutions` is similar to [yarn"s `resolutions`](https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md), but only supports the following syntaxes.

- `a/b` denotes the directly nested dependency `b` of the project"s dependency `a`.
- `**/a` denotes all the nested dependencies `a` of the project.
- `a` is an alias for `**/a`

```js
install({
  ...,
  // If the xx configuration has changed, you should remove the `lockfile`
  lockData: localStorage.getItem("lockData"),
  resolutions: {
    "react": "^17",
    "@arco-design/web-react/react": "^16",
  },
}).then((manager) => {
  // ...
})
```


### Other apis

```js
// Add other deps
install().then(async manager => {
  // - `version` default is `latest`
  // - `depType` default is `prod`
  const pkgNode = manager.get("pkgName");
  const expressNode = await pkgNode.add("express", "latest", "prod");
  console.log(expressNode);

  // Update lockfile data
  const lockData = apis.lockfile.output();
  localStorage.setItem("lockData", JSON.stringify(lockData));
})

// If an error occurs, log errors
install().then(manager => {
  if (manager.hasError()) {
    manager.logError();
  }
})

// View all nodes
install().then(manager => {
  console.log(manager.packages);
  manager.each((name, version, node) => {
    // ...
  })
})

// Filter some packages
install({
  filter: (name, wanted, edgeType) => edgeType === "dev", // Filter `devDependencies`
  filter: (name, wanted, edgeType) => name.startsWith("@types/"), // Filter `@types/x`
}).then(manager => {
  // ...
})

// Get the packages that need to be added or deleted
install().then(manager => {
  const lockData = manager.lockfile.output();
  const diffData = manager.lockfile.diff(lockData);
  console.log(diffData);
})

// When there is a network error, try again
install({
  ...,
  retry: (err, name, times, next) => {
    if (times < 5) {
      console.log(`"${name}" retry times ${times}.`);
      next(); // Next request
    } else {
      throw err; // Must throw an error
    }
  },
}).then(manager => {
  // ...
})
```


### Use in `nodeJs`

[Api used in nodejs](./lib)

```js
// `The first way`: pass in custom `fetch`
install({
  customFetch: require("node-fetch"),
}).then(manager => {
  // ...
})

// `The second way`: set the global `fetch`
globalThis.fetch = require("node-fetch");
install().then(manager => {
  // ...
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
