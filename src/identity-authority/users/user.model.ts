import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  boolean,
  collection,
  length,
  nullable,
  timestamp,
  unique,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import * as IdentityAuthority from "../module/types";
import {
  assertIsCreationContext,
  assertIsEmailAddress,
  assertIsIdentityProvider,
  assertIsRole,
  assertIsStatus,
  assertIsUsername,
  assertIsUserType,
} from "./user.assertions";

@collection("users")
export class UserModel extends BaseEntity {
  @length(12)
  @varchar(assertIsIdentityProvider)
  identity_provider!: IdentityAuthority.Providers.Identity;

  @length(64)
  @unique()
  @varchar(assertIsEmailAddress)
  email_address!: IdentityAuthority.Users.Fields.UniqueEmailAddress;

  @length(32)
  @unique()
  @varchar(assertIsUsername)
  username!: IdentityAuthority.Users.Fields.UniqueUsername;

  @boolean()
  is_email_verified!: boolean;

  @nullable()
  @timestamp()
  verified_since!: string | null;

  @nullable()
  @timestamp()
  suspended_until!: string | null;

  @length(12)
  @varchar(assertIsCreationContext)
  creation_context!: "external" | "internal";

  @length(12)
  @varchar(assertIsRole)
  role!: "webadmin" | "user" | "moderator";

  @length(512)
  @nullable()
  @varchar()
  password_hash!: IdentityAuthority.Users.Fields.HashedPassword | null;

  @length(12)
  @varchar(assertIsStatus)
  status!: IdentityAuthority.Users.Status.Type;

  @length(12)
  @varchar(assertIsUserType)
  type!: IdentityAuthority.Users.Type;

  @length(64)
  @varchar()
  otp_secret!: string;
}
