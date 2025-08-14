export function assertValidRecord(
  value: unknown
): asserts value is { [key: string]: any } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Expected an object with string keys and any values");
  }
}
