import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { boolean, collection, EntityId, references } from "../../core/orm/entity/decorators";
import { StoreModel } from "../stores/store.model";

@collection("access_directory")
export class AccessDirectoryModel extends BaseEntity<AccessDirectoryModel> {
  
  @EntityId()
  user_id: Core.Entity.Id

  @references(StoreModel, 'entity_id')
  @EntityId()
  store_id: Core.Entity.Id

  @boolean()
  is_active: boolean

}