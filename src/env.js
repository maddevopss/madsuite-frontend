const nodeEnv = typeof process !== "undefined" && process.env ? process.env : {};

function getViteEnv() {
  if (nodeEnv.JEST_WORKER_ID || nodeEnv.NODE_ENV === "test") {
    return {};
  }

  try {
    return Function("return typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}")();
  } catch {
    return {};
  }
}

const viteEnv = getViteEnv();

export const env = new Proxy(
  {},
  {
    get(_, prop) {
      if (prop in viteEnv) return viteEnv[prop];
      if (prop in nodeEnv) return nodeEnv[prop];
      return undefined;
    },
  },
);
