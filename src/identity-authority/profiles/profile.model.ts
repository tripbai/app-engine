import { IdentityProvider } from "aws-sdk/clients/cloudformation";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  collection,
  length,
  nullable,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import * as IdentityAuthority from "../module/types";
import { ProfileValidator } from "./profile.validator";

@collection("profiles")
export class ProfileModel extends BaseEntity<ProfileModel> {
  @length(32)
  @varchar(ProfileValidator.first_name)
  first_name: IdentityAuthority.Profile.Fields.FirstName;

  @length(32)
  @varchar(ProfileValidator.last_name)
  last_name: IdentityAuthority.Profile.Fields.LastName;

  @length(384)
  @nullable()
  @varchar(ProfileValidator.image)
  profile_photo: IdentityAuthority.Profile.Fields.Image | null;

  @length(384)
  @nullable()
  @varchar(ProfileValidator.image)
  cover_photo: IdentityAuthority.Profile.Fields.Image | null;

  @length(512)
  @nullable()
  @varchar(ProfileValidator.about)
  about: string | null;
}
