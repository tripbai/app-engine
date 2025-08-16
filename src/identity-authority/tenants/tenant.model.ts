import * as Core from "../../core/module/types";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  collection,
  length,
  nullable,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import { ProfileValidator } from "../profiles/profile.validator";
import {
  assertIsTenantName,
  assertIsTenantSecretKey,
} from "./tenant.assertions";

@collection("tenants")
export class TenantModel extends BaseEntity {
  @length(64)
  @varchar(assertIsTenantName)
  name!: string;

  @length(32)
  @varchar(assertIsTenantSecretKey)
  secret_key!: string;

  @length(384)
  @nullable()
  @varchar(ProfileValidator.image)
  profile_photo!: Core.Uploads.FilePath | null;

  @length(384)
  @nullable()
  @varchar(ProfileValidator.image)
  cover_photo!: Core.Uploads.FilePath | null;
}
