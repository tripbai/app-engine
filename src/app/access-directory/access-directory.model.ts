import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";

export class AccessDirectoryModel extends BaseEntity<AccessDirectoryModel> {

  user_id: Core.Entity.Id

  store_id: Core.Entity.Id

  is_active: boolean

  permissions: Core.Authorization.ConcreteToken

}