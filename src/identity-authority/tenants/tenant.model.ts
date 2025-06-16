import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { collection, length, nullable, varchar } from "../../core/orm/entity/decorators";
import { ProfileValidator } from "../profiles/profile.validator";
import { TenantValidator } from "./tenant.validator";

@collection('tenants')
export class TenantModel extends BaseEntity<TenantModel> {

  @length(64)
  @varchar(TenantValidator.name)
  name: string

  @length(32)
  @varchar(TenantValidator.secret_key)
  secret_key: string

  @length(384)
  @nullable()
  @varchar(ProfileValidator.image)
  profile_photo: Core.File.UploadPath | null

  @length(384)
  @nullable()
  @varchar(ProfileValidator.image)
  cover_photo: Core.File.UploadPath | null

}