const http = require("http");
const https = require("https");

exports.httpClient = (url) => (url.startsWith("https:") ? https : http);

// For `gpi` use only
exports.simpleFetch = (url, opts) => {
  return new Promise((resolve, reject) => {
    exports
      .httpClient(url)
      .get(url, { headers: opts?.headers }, (res) => {
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
