export function assertIsLocationId(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("location_id must be a string");
  }
  /**
   * @TODO implement location_id codes
   */
}
