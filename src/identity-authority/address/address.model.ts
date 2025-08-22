import * as Core from "../../core/module/types";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { varchar } from "../../core/orm/entity/entity-decorators";
import { assertValidEntityId } from "../../core/utilities/entityToolkit";

export class AddressModel extends BaseEntity {
  @varchar(assertValidEntityId)
  addressable_id!: Core.Entity.Id;
}
