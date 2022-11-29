const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const httpClient = (exports.httpClient = (url) =>
  url.startsWith("https:") ? https : http);

// For `gpi` use only
exports.simpleFetch = (url, opts = {}) => {
  return new Promise((resolve, reject) => {
    httpClient(url)
      .get(url, { headers: opts.headers }, (res) => {
        const { statusCode } = res;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
          res.resume();
          // Consume response data to free up memory
          const error = new Error(
            "Request Failed.\n" + `Status Code: ${statusCode}`
          );
          error.code = statusCode;
          reject(error);
        } else {
          res.setEncoding("utf8");
          let rawData = "";
          res.on("data", (chunk) => (rawData += chunk));
          res.on("end", () => {
            const headers = new Map();
            for (const k in res.headers) {
              headers.set(k, res.headers[k]);
            }
            resolve({
              headers,
              code: statusCode,
              json: async () => JSON.parse(rawData),
            });
          });
        }
      })
      .on("error", (e) => reject(e));
  });
};

const isTypeSync = (fsStatType, statsMethodName, filePath) => {
  if (typeof filePath !== "string") {
    throw new TypeError(`Expected a string, got ${typeof filePath}`);
  }
  try {
    return fs[fsStatType](filePath)[statsMethodName]();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

exports.isFileSync = isTypeSync.bind(null, "statSync", "isFile");
exports.isDirectorySync = isTypeSync.bind(null, "statSync", "isDirectory");
exports.isSymlinkSync = isTypeSync.bind(null, "lstatSync", "isSymbolicLink");

const normalizePath = (path) => {
  const replace = [
    [/\\/g, "/"],
    [/(\w):/, "/$1"],
    [/(\w+)\/\.\.\/?/g, ""],
    [/^\.\//, ""],
    [/\/\.\//, "/"],
    [/\/\.$/, ""],
    [/\/$/, ""],
  ];
  replace.forEach((array) => {
    while (array[0].test(path)) {
      path = path.replace(array[0], array[1]);
    }
  });
  return path;
};

exports.pathEqual = (actual, expected) => {
  return (
    actual === expected || normalizePath(actual) === normalizePath(expected)
  );
};

exports.isWindows = () => {
  return (
    process &&
    (process.platform === "win32" || /^(msys|cygwin)$/.test(process.env.OSTYPE))
  );
};
