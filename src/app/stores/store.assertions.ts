export function assertIsStoreName(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("store name must be a string");
  }
  if (value.length < 5 || value.length > 64) {
    throw new Error("store name must be within 5 - 65 characters");
  }
}

export function assertIsStoreAbout(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("store about must be a string");
  }
  if (value.length < 1 || value.length > 320) {
    throw new Error("store about must be within 1 - 320 characters");
  }
}

export const assertIsStoreLanguage = (value: string) => {
  /** @TODO implement language codes */
};

export const assertIsStoreStatus = (value: string) => {
  if (
    value !== "active" &&
    value !== "deactivated" &&
    value !== "suspended" &&
    value !== "pending"
  ) {
    throw new Error("store status value is invalid");
  }
};
