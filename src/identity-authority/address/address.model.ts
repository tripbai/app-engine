import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { varchar } from "../../core/orm/entity/entity-decorators";
import { EntityToolkit } from "../../core/orm/entity/entity-toolkit";

export class AddressModel extends BaseEntity<AddressModel> {
  @varchar(assertValidEntityId)
  addressable_id: Core.Entity.Id;
}
