console.time("install");

const pkgJson = {
  dependencies: {
    vue: "^2.7.12",
    "create-react-app": "latest",
    "@arco-design/web-react": "*",
  },
  workspace: {
    p1: {
      dependencies: {
        vue: "*",
      },
    },
    p2: {
      dependencies: {
        react: "*",
        vue: "^2.7.13",
      },
    },
  },
};

install({
  pkgJson,
  lockData: localStorage.getItem("lockData"),
  filter: (name) => name.startsWith("@types/"),
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

  if (isNodeEnv) debugger;
});
