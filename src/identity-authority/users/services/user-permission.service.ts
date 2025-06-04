import { injectable } from "inversify";
import { UserModel } from "../user.model";
import { Core } from "../../../core/module/module";

@injectable()
export class UserPermissionService {
  
  addPermissionsByRole(
    permissions: Array<Core.Authorization.ConcreteToken>,
    userId: UserModel['entity_id'],
    role: UserModel['role']
  ){
    switch (role) {
      case 'webadmin': 
        permissions.push(
          this.getWebAdmin()
        )
        break;
      case 'moderator': 
        permissions.push(
          this.getModerator()
        )
        break;
      default: 
        permissions.push(
          this.getBasicUser(userId)
        )
        break;
    }
    return permissions
  }

  getWebAdmin(){
    return 'iauth:*' as Core.Authorization.ConcreteToken
  }

  getModerator(){
    return 'iauth:users:*:moderate' as Core.Authorization.ConcreteToken
  }

  getBasicUser(userId: Core.Entity.Id){
    return `iauth:users:${userId}` as Core.Authorization.ConcreteToken
  }

}