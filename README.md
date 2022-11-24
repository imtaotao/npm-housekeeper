<div align='center'>
<h2>npm-housekeeper</h2>

[![NPM version](https://img.shields.io/npm/v/npm-housekeeper.svg?color=a1b858&label=)](https://www.npmjs.com/package/npm-housekeeper)

</div>

Build an ideal tree through `package.json` (cross-platform, can be used in `browsers`).

[Online test platform](https://imtaotao.github.io/npm-housekeeper/)

### NPM

```js
import { install } from 'npm-housekeeper';

install({
  pkgJson: {
    dependencies: {
      'create-react-app': "*",
      '@arco-design/web-react': '*',
    },
    projects: {
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
  legacyPeerDeps: false, // default value `false`
  registry: 'https://registry.npmjs.org/', // default value `https://registry.npmjs.org` 
  lockData: localStorage.getItem('lockData'), // set lockfile data
}).then(apis => {
  const lockData = apis.lockfile.output();
  localStorage.setItem('lockData', JSON.stringify(lockData, null, 2));
  
  console.log(apis.node);
  console.log(lockData);
})
```


### CDN

```html
<!DOCTYPE html>
<html lang="en">
<body>
  <script src="https://unpkg.com/butler/dist/npm-housekeeper.umd.js"></script>
  <script>
    const { install } = window.Housekeeper;
    // ...
  </script>
</body>
</html>
```
