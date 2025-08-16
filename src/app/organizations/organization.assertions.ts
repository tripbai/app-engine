import * as TripBai from "../module/types";

export function assertIsOrganizationStatus(
  value: unknown
): asserts value is TripBai.Organizations.Fields.Status {
  if (typeof value !== "string") {
    throw new Error("invalid organization status value");
  }
  if (
    value !== "active" &&
    value !== "deactivated" &&
    value !== "suspended" &&
    value !== "pending" &&
    value !== "archived"
  ) {
    throw new Error("invalid organization status value");
  }
}

export function assertIsOrganizationBusinessName(
  value: unknown
): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("invalid organization business name value");
  }
  if (value.length < 5 || value.length > 120) {
    throw new Error(
      "organization business name must be within 5 - 120 characters"
    );
  }
}
