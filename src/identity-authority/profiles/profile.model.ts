import { IdentityProvider } from "aws-sdk/clients/cloudformation";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { nullable, varchar } from "../../core/orm/entity/decorators";
import { IdentityAuthority } from "../module/module.interface";
import { ProfileValidator } from "./profile.validator";

export class ProfileModel extends BaseEntity<ProfileModel> {

  @varchar(ProfileValidator.first_name)
  first_name: IdentityAuthority.Profile.Fields.FirstName

  @varchar(ProfileValidator.last_name)
  last_name: IdentityAuthority.Profile.Fields.LastName

  @nullable()
  @varchar(ProfileValidator.image)
  profile_photo: IdentityAuthority.Profile.Fields.Image | null

  @nullable()
  @varchar(ProfileValidator.image)
  cover_photo: IdentityAuthority.Profile.Fields.Image | null

  @nullable()
  @varchar(ProfileValidator.about)
  about: string | null

}