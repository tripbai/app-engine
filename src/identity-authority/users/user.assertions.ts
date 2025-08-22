import * as IdentityAuthority from "../module/types";
import { assertNonEmptyString } from "../../core/utilities/assertValid";

/**
 * Asserts that a value is a valid username
 */
export function assertIsUsername(
  value: unknown
): asserts value is IdentityAuthority.Users.Fields.Username {
  assertNonEmptyString(value);
  const regex = /^[a-zA-Z0-9_]+$/;
  if (!regex.test(value)) {
    throw new Error("invalid or unsupported username format");
  }
  if (value.length < 3 || value.length > 32) {
    throw new Error("username must be within 3 to 32 characters long");
  }
}

/**
 * Asserts that a value is a valid email address
 */
export function assertIsEmailAddress(
  value: unknown
): asserts value is IdentityAuthority.Users.Fields.EmailAddress {
  assertNonEmptyString(value);
  /**
   * @TODO A more comprehensive email format validation
   */
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(value)) {
    throw new Error("invalid or unsupported email address format");
  }
  if (value.length < 8 || value.length > 64) {
    throw new Error("email address must be within 8 - 64 characters long");
  }
}

/**
 * Asserts that a value is a valid user type
 */
export function assertIsUserType(
  value: unknown
): asserts value is IdentityAuthority.Users.Type {
  assertNonEmptyString(value);
  if (value !== "concrete" && value !== "abstract") {
    throw new Error("invalid user type");
  }
}

/**
 * Asserts that a value is a valid raw password
 */
export function assertIsRawPassword(
  value: unknown
): asserts value is IdentityAuthority.Users.Fields.RawPassword {
  assertNonEmptyString(value);
  if (value.length < 8 || value.length > 64) {
    throw new Error("insufficient or unsupported password length");
  }
}

/**
 * Asserts that a value is a valid identity provider
 */
export function assertIsIdentityProvider(
  value: unknown
): asserts value is IdentityAuthority.Providers.Identity {
  assertNonEmptyString(value);
  if (value !== "fireauth" && value !== "google" && value !== "iauth") {
    throw new Error("invalid identity provider");
  }
}

/**
 * Asserts that a value is a valid creation context
 */
export function assertIsCreationContext(
  value: unknown
): asserts value is "external" | "internal" {
  assertNonEmptyString(value);
  if (value !== "internal" && value !== "external") {
    throw new Error("invalid creation_context value");
  }
}

/**
 * Asserts that a value is a valid role
 */
export function assertIsRole(
  value: unknown
): asserts value is "webadmin" | "user" | "moderator" {
  assertNonEmptyString(value);
  if (value !== "webadmin" && value !== "moderator" && value !== "user") {
    throw new Error("invalid user role value");
  }
}

/**
 * Asserts that a value is a valid status
 */
export function assertIsStatus(
  value: unknown
): asserts value is IdentityAuthority.Users.Status.Type {
  assertNonEmptyString(value);
  if (
    value !== "active" &&
    value !== "unverified" &&
    value !== "banned" &&
    value !== "deactivated" &&
    value !== "suspended" &&
    value !== "archived"
  ) {
    throw new Error("invalid user status");
  }
}
