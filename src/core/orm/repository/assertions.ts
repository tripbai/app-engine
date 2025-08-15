import { FlatDatabaseRecord } from "../../providers/database/database.provider";

export function assertFlatDatabaseRecord(
  value: unknown
): asserts value is FlatDatabaseRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Expected an object");
  }
  for (const [key, val] of Object.entries(value)) {
    if (!["string", "number", "boolean"].includes(typeof val) && val !== null) {
      throw new TypeError(
        `Invalid value for key "${key}". Expected string, number, boolean, or null.`
      );
    }
  }
}
