import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { EntityId, collection, length, nullable, references, varchar } from "../../core/orm/entity/decorators";
import { TripBai } from "../module/module.interface";
import { OrganizationModel } from "../organizations/organization.model";
import { PackageModel } from "../packages/package.model";
import { StoreValidator } from "./store.validator";

@collection("stores")
export class StoreModel extends BaseEntity<StoreModel> {

  @references(OrganizationModel, 'entity_id')
  @EntityId()
  organization_id: Core.Entity.Id

  @length(64)
  @varchar(StoreValidator.name)
  name: string

  @length(360)
  @nullable()
  @varchar(StoreValidator.photo)
  profile_photo_src: Core.File.UploadPath | null

  @length(360)
  @nullable()
  @varchar(StoreValidator.photo)
  cover_photo_src: Core.File.UploadPath | null

  @references(PackageModel, 'entity_id')
  @EntityId()
  package_id: Core.Entity.Id

  @length(320)
  @nullable()
  @varchar(StoreValidator.about)
  about: string | null

  @length(12)
  @varchar(StoreValidator.language)
  language: string

  @nullable()
  @length(32)
  @varchar(StoreValidator.location_id)
  location_id: TripBai.Locations.Id | null

  @length(64)
  @varchar()
  secret_key: string

  @length(12)
  @varchar(StoreValidator.status)
  status: TripBai.Stores.Fields.Status

}