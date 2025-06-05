import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { EntityId, boolean, collection, length, nullable, references, varchar } from "../../core/orm/entity/decorators";
import { UserModel } from "../users/user.model";

@collection('teams')
export class TeamModel extends BaseEntity<TeamModel> {

  @EntityId()
  tenant_id: Core.Entity.Id

  @references(UserModel, 'entity_id')
  @EntityId()
  user_id: Core.Entity.Id

  @nullable()
  @EntityId()
  role_id: Core.Entity.Id | null

  @boolean()
  is_active: boolean 

  @boolean()
  is_owner: boolean

}