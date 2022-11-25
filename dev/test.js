console.time("install");

install({
  pkgJson: {
    dependencies: {
      "create-react-app": "latest",
      "@arco-design/web-react": "*",
      vue: "^2.7.12",
    },
    workspace: {
      p1: {
        dependencies: {
          vue: "*",
        },
      },
      p2: {
        dependencies: {
          vue: "^2.7.13",
          react: "*",
        },
      },
    },
  },
  lockData: localStorage.getItem("lockData"),
}).then(async (apis) => {
  globalThis.apis = apis;
  console.timeEnd("install");
  console.log(apis.node);

  const setLockfile = () => {
    const lockData = apis.lockfile.output();
    localStorage.setItem("lockData", JSON.stringify(lockData, null, 2));
    console.log(lockData);
  };
  setLockfile();

  const expressNode = await apis.node.add("express");
  console.log(expressNode);
  setLockfile();
  
  if (isNodeEnv) {
    debugger
  }
});
