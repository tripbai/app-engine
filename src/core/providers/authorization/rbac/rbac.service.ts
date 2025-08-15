import { inject, injectable } from "inversify";
import * as Core from "../../../module/types";
import { AbstractAuthorizationProvider } from "../authorization.provider";
import { PermissionManager } from "../../../services/rbac/permissions.manager";

@injectable()
export class NativeRBACService implements AbstractAuthorizationProvider {
  constructor(
    @inject(PermissionManager)
    public readonly PermissionManager: PermissionManager
  ) {}

  canOperate(
    resourceObject: { [key: string]: any },
    requiredPermission: Core.Authorization.AbstractToken,
    grantedPermissions: Core.Authorization.ConcreteToken[]
  ): boolean {
    const resolvedRequiredPermission = this.PermissionManager.populate(
      requiredPermission,
      resourceObject
    );
    return this.PermissionManager.satisfies(
      grantedPermissions,
      resolvedRequiredPermission
    );
  }

  createPermission(
    resourceObject: { [key: string]: any },
    permissionToken: Core.Authorization.AbstractToken
  ): Core.Authorization.ConcreteToken {
    return this.PermissionManager.populate(permissionToken, resourceObject);
  }
}
