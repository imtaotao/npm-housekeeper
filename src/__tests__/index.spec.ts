import { install } from "../index";

describe("test", () => {
  it('install', async () => {
    const manager = await install({
      customFetch: require("node-fetch"),
      workspace: {
        ".": {
          dependencies: {
            vue: "^2.7.12",
          },
        },
        p1: {
          dependencies: {
            react: "^15",
          },
        },
      },
    })
    const lockData = manager.lockfile.output();
    console.log(lockData);
    expect(manager.hasError()).toBe(false);
  })
});
