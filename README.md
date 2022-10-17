<div align='center'>
<h2>gpi</h2>

[![NPM version](https://img.shields.io/npm/v/gpi.svg?color=a1b858&label=)](https://www.npmjs.com/package/gpi)

</div>

Get a specific package information through a version with range selection, the search algorithm comes from `npm/cli`

[Online test platform](https://imtaotao.github.io/gpi/)

### NPM

```js
import { gpi } from 'gpi';

gpi('react-dom', '^16.x.x').then(res => {
  console.log(res);
})
```


### CDN

```html
<!DOCTYPE html>
<html lang="en">
<body>
  <script src="https://unpkg.com/gpi/dist/gpi.umd.js"></script>
  <script>
    Gpi.gpi('react-dom', '^16.x.x').then(res => {
      console.log(res);
    })
  </script>
</body>
</html>
```
