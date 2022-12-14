console.time("install");

install({
  workspace: {
    ".": {
      dependencies: {
        vue: "^2.7.12",
        "create-react-app": "latest",
        "@arco-design/web-react": "*",
      },
    },
    p1: {
      dependencies: {
        vue: "*",
        react: "^15",
        // p2: "workspace:*",
      },
    },
    // p2: {
    //   name: "p2",
    //   dependencies: {
    //     react: "*",
    //     vue: "^2.7.13",
    //   },
    // },
  },
  // lockData: localStorage.getItem("lockData"),
  resolutions: {
    // react: "^17",
    "@arco-design/web-react/react": "^16", // 会影响顺序
  },
  filter: (name) => name.startsWith("@types/"),
  retry: (err, name, times, next) => {
    if (times > 5) throw err;
    console.log(`${name} retry times ("${times}")`);
    next();
  },
}).then(async (manager) => {
  console.timeEnd("install");
  globalThis.manager = manager;

  console.log("---------------");
  const pkgName = "vue";
  for (const v in manager.packages[pkgName]) {
    for (const edge of manager.packages[pkgName][v].usedEdges) {
      console.log(
        `${pkgName}@${v}(wanted: ${edge.wanted}, resolution: ${edge.resolution} ), parentProject is "${edge.parentNode.name}@${edge.parentNode.version}"`
      );
    }
  }

  const setLockfile = () => {
    if (manager.hasError()) {
      manager.logError();
    } else {
      const lockData = manager.lockfile.output();
      const diffData = manager.lockfile.diff(lockData);
      // console.log(lockData);
      // console.log(diffData);
      globalThis.lockData = lockData;

      manager.lockfile.set(lockData);
      localStorage.setItem("lockData", JSON.stringify(lockData, null, 2));
    }
  };
  setLockfile();

  // const expressNode = await manager.get(".").add("express");
  // console.log(expressNode);
  setLockfile();

  if (isNodeEnv) debugger;
});
