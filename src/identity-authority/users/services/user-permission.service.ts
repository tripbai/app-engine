import { inject, injectable } from "inversify";
import { UserModel } from "../user.model";
import * as Core from "../../../core/module/types";
import { AbstractAuthorizationProvider } from "../../../core/providers/authorization/authorization.provider";

@injectable()
export class UserPermissionService {
  constructor(
    @inject(AbstractAuthorizationProvider)
    private abstractAuthorizationProvider: AbstractAuthorizationProvider
  ) {}

  addPermissionsByRole(
    permissions: Array<Core.Authorization.ConcreteToken>,
    userId: UserModel["entity_id"],
    role: UserModel["role"]
  ) {
    switch (role) {
      case "webadmin":
        permissions.push(this.getWebAdminPermission());
        break;
      case "moderator":
        permissions.push(this.getModeratorPermission());
        break;
      default:
        permissions.push(this.getBasicUserPermission(userId));
        break;
    }
    return permissions;
  }

  getWebAdminPermission() {
    return this.abstractAuthorizationProvider.createPermission(
      { domain: "*" },
      this.getWebAdminLikePermission()
    );
  }

  getWebAdminLikePermission() {
    return "iauth:{domain}" as Core.Authorization.AbstractToken;
  }

  getModeratorPermission() {
    return this.abstractAuthorizationProvider.createPermission(
      { user_id: "*" },
      this.getModeratorLikePermission()
    );
  }

  getModeratorLikePermission() {
    return "iauth:users:{user_id}:moderate" as Core.Authorization.AbstractToken;
  }

  getBasicUserPermission(userId: Core.Entity.Id) {
    return this.abstractAuthorizationProvider.createPermission(
      { user_id: userId },
      this.getBasicUserLikePermission()
    );
  }

  getBasicUserLikePermission() {
    return "iauth:users:{user_id}" as Core.Authorization.AbstractToken;
  }

  isOneOfThePermissionsBasicUserLike(
    grantedPermissions: Array<Core.Authorization.ConcreteToken>,
    forUserId: Core.Entity.Id
  ) {
    return this.abstractAuthorizationProvider.canOperate(
      { user_id: forUserId },
      this.getBasicUserLikePermission(),
      grantedPermissions
    );
  }

  isOneOfThePermissionsAdminLike(
    grantedPermissions: Array<Core.Authorization.ConcreteToken>
  ) {
    return this.abstractAuthorizationProvider.canOperate(
      { domain: "*" },
      this.getWebAdminLikePermission(),
      grantedPermissions
    );
  }

  caOneOfThePermissionsOperateUser(
    grantedPermissions: Array<Core.Authorization.ConcreteToken>,
    userIdToOperate: Core.Entity.Id
  ) {
    return this.abstractAuthorizationProvider.canOperate(
      { user_id: userIdToOperate },
      this.getBasicUserLikePermission(),
      grantedPermissions
    );
  }

  hasModeratorPermission(
    grantedPermissions: Array<Core.Authorization.ConcreteToken>
  ) {
    return grantedPermissions.includes(this.getModeratorPermission());
  }
}
