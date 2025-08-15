import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  EntityId,
  collection,
  length,
  references,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import { TripBai } from "../module/module.interface";
import { PackageModel } from "../packages/package.model";
import { OrganizationValidator } from "./organization.validator";

@collection("organizations")
export class OrganizationModel extends BaseEntity<OrganizationModel> {
  @EntityId()
  secret_key: string;

  @length(120)
  @varchar(OrganizationValidator.business_name)
  business_name: string;

  @references(PackageModel, "entity_id")
  @EntityId()
  package_id: Core.Entity.Id;

  @length(16)
  @varchar(OrganizationValidator.status)
  status: TripBai.Organizations.Fields.Status;
}
