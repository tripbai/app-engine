import { inject, injectable } from "inversify";
import { Core } from "../../../module/module";
import { AuthorizationProvider } from "../authorization.provider";
import { PermissionManager } from "../../../services/rbac/permissions.manager";

@injectable()
export class NativeRBACService implements AuthorizationProvider {

  constructor(
    @inject(PermissionManager) public readonly PermissionManager: PermissionManager
  ){
  }
  
  canOperate(
    resourceObject: { [key: string]: any; }, 
    requiredPermission: Core.Authorization.AbstractToken, 
    grantedPermissions: Core.Authorization.ConcreteToken[]
  ): boolean {
      const resolvedRequiredPermission = this.PermissionManager.populate(requiredPermission, resourceObject)
      return this.PermissionManager.satisfies(
        grantedPermissions,
        resolvedRequiredPermission
      )
  }

  grantPermission(
    requester: Core.Authorization.Requester,
    resourceObject: {[key:string]:any},
    permissionToken: Core.Authorization.AbstractToken
  ): void {
    const resolvedRequiredPermission = this.PermissionManager.populate(permissionToken, resourceObject)
    requester.permissions.push(resolvedRequiredPermission)
  }

} 