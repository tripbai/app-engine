import * as Core from "../../core/module/types";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  EntityId,
  collection,
  length,
  references,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import * as TripBai from "../module/types";
import { PackageModel } from "../packages/package.model";
import {
  assertIsOrganizationBusinessName,
  assertIsOrganizationStatus,
} from "./organization.assertions";

@collection("organizations")
export class OrganizationModel extends BaseEntity {
  @EntityId()
  secret_key!: string;

  @length(120)
  @varchar(assertIsOrganizationBusinessName)
  business_name!: string;

  @references(PackageModel, "entity_id")
  @EntityId()
  package_id!: Core.Entity.Id;

  @length(16)
  @varchar(assertIsOrganizationStatus)
  status!: TripBai.Organizations.Fields.Status;
}
