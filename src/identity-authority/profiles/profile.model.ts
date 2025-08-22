import { IdentityProvider } from "aws-sdk/clients/cloudformation";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  collection,
  length,
  nullable,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import * as IdentityAuthority from "../module/types";
import {
  assertIsFirstName,
  assertIsLastName,
  assertIsProfileAbout,
} from "./profile.assertions";
import { assertIsFileUploadPath } from "../../core/utilities/fileupath";

@collection("profiles")
export class ProfileModel extends BaseEntity {
  @length(32)
  @varchar(assertIsFirstName)
  first_name!: IdentityAuthority.Profile.Fields.FirstName;

  @length(32)
  @varchar(assertIsLastName)
  last_name!: IdentityAuthority.Profile.Fields.LastName;

  @length(384)
  @nullable()
  @varchar(assertIsFileUploadPath)
  profile_photo!: IdentityAuthority.Profile.Fields.Image | null;

  @length(384)
  @nullable()
  @varchar(assertIsFileUploadPath)
  cover_photo!: IdentityAuthority.Profile.Fields.Image | null;

  @length(512)
  @nullable()
  @varchar(assertIsProfileAbout)
  about!: string | null;
}
