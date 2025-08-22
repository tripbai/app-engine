export function assertIsTenantName(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("tenant name must be a string");
  }
  if (value.length === 0 || value.length > 64) {
    throw new Error("tenant name must not be empty or more than 64 characters");
  }
}
export function assertIsTenantSecretKey(
  value: unknown
): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("tenant secret key must be a string");
  }
  if (value.length !== 32) {
    throw new Error(
      "tenant secret must not more than or less than 32 characters"
    );
  }
}
