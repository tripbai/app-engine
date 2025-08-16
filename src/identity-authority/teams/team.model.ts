import * as Core from "../../core/module/types";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  EntityId,
  boolean,
  collection,
  length,
  nullable,
  references,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import { TenantModel } from "../tenants/tenant.model";
import { UserModel } from "../users/user.model";

@collection("teams")
export class TeamModel extends BaseEntity {
  @references(TenantModel, "entity_id")
  @EntityId()
  tenant_id!: Core.Entity.Id;

  @references(UserModel, "entity_id")
  @EntityId()
  user_id!: Core.Entity.Id;

  @nullable()
  @EntityId()
  role_id!: Core.Entity.Id | null;

  @boolean()
  is_active!: boolean;

  @boolean()
  is_owner!: boolean;
}
