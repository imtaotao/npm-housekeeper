console.time("install");

const ks = Object.keys;

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
        p2: "workspace:*",
      },
    },
    p2: {
      name: "p2",
      dependencies: {
        react: "*",
        vue: "^2.7.13",
      },
    },
  },
  lockData: localStorage.getItem("lockData"),
  filter: (name) => name.startsWith("@types/"),
}).then(async (manager) => {
  console.timeEnd("install");
  globalThis.manager = manager;

  const setLockfile = () => {
    if (manager.hasError()) {
      manager.logError();
    } else {
      const lockData = manager.lockfile.output();
      const diffData = manager.lockfile.diff(lockData);
      console.log(lockData);
      console.log(diffData);

      manager.lockfile.set(lockData);
      localStorage.setItem("lockData", JSON.stringify(lockData, null, 2));
    }
  };
  setLockfile();

  const expressNode = await manager.get(".").add("express");
  console.log(expressNode);
  setLockfile();

  if (isNodeEnv) debugger;
});
