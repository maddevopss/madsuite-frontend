// React 18/19 concurrent act support for Jest + jsdom.
// Without this, React logs: "The current testing environment is not configured to support act(...)".
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
/* global globalThis */
import "@testing-library/jest-dom";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock BroadcastChannel for JSDOM environment
if (typeof globalThis.BroadcastChannel === "undefined" || !globalThis.BroadcastChannel) {
  globalThis.BroadcastChannel = class {
    constructor(name) {
      this.name = name;
      this.onmessage = null;
    }
    postMessage(data) {
      if (this.onmessage) this.onmessage({ data });
    }
    onmessage() {}
    close() {}
  };
}

// Mock navigator.locks (utilisé dans api.jsx pour la synchronisation des onglets)
if (typeof navigator !== "undefined" && !navigator.locks) {
  Object.defineProperty(navigator, "locks", {
    writable: true,
    value: {
      request: async (name, options, callback) => {
        if (typeof options === "function") return options();
        return callback();
      },
    },
  });
}

// Polyfill pour atob/btoa si nécessaire (Node 25 les a en global, mais Jest VM peut les masquer)
if (typeof globalThis.atob === "undefined") {
  globalThis.atob = (str) => Buffer.from(str, "base64").toString("binary");
}
