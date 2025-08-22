import { assertNonEmptyString } from "../../core/utilities/assertValid";
import * as IdentityAuthority from "../module/types";

export function assertIsFirstName(
  value: unknown
): asserts value is IdentityAuthority.Profile.Fields.FirstName {
  assertNonEmptyString(value);
  if (value.length < 2 || value.length > 32) {
    throw new Error("first name must be within 2 - 32 characters long");
  }
}

export function assertIsLastName(
  value: unknown
): asserts value is IdentityAuthority.Profile.Fields.LastName {
  assertNonEmptyString(value);
  if (value.length < 2 || value.length > 32) {
    throw new Error("last name must be within 2 - 32 characters long");
  }
}

export function assertIsProfileAbout(value: unknown): asserts value is string {
  assertNonEmptyString(value);
  if (value.length > 512) {
    throw new Error("user notes must be not more than 512 characters");
  }
}
