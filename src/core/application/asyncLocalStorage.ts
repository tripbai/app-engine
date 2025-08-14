const { AsyncLocalStorage } = require("node:async_hooks");

export const asyncLocalStorage = new AsyncLocalStorage();
