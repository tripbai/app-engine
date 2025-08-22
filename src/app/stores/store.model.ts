import * as Core from "../../core/module/types";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  EntityId,
  collection,
  length,
  nullable,
  references,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import { assertIsFileUploadPath } from "../../core/utilities/fileupath";
import { assertIsLocationId } from "../locations/location.assertions";
import * as TripBai from "../module/types";
import { OrganizationModel } from "../organizations/organization.model";
import { PackageModel } from "../packages/package.model";
import {
  assertIsStoreAbout,
  assertIsStoreLanguage,
  assertIsStoreName,
  assertIsStoreStatus,
} from "./store.assertions";

@collection("stores")
export class StoreModel extends BaseEntity {
  @references(OrganizationModel, "entity_id")
  @EntityId()
  organization_id!: Core.Entity.Id;

  @length(64)
  @varchar(assertIsStoreName)
  name!: string;

  @length(360)
  @nullable()
  @varchar(assertIsFileUploadPath)
  profile_photo_src!: Core.Uploads.FilePath | null;

  @length(360)
  @nullable()
  @varchar(assertIsFileUploadPath)
  cover_photo_src!: Core.Uploads.FilePath | null;

  @references(PackageModel, "entity_id")
  @EntityId()
  package_id!: Core.Entity.Id;

  @length(320)
  @nullable()
  @varchar(assertIsStoreAbout)
  about!: string | null;

  @length(12)
  @varchar(assertIsStoreLanguage)
  language!: string;

  @nullable()
  @length(32)
  @varchar(assertIsLocationId)
  location_id!: TripBai.Locations.Id | null;

  @length(64)
  @varchar()
  secret_key!: string;

  @length(12)
  @varchar(assertIsStoreStatus)
  status!: TripBai.Stores.Fields.Status;
}
