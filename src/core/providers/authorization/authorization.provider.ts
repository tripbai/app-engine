import * as Core from "../../module/types";

export abstract class AbstractAuthorizationProvider {
  abstract canOperate(
    resourceObject: { [key: string]: any },
    requiredPermission: Core.Authorization.AbstractToken,
    grantedPermissions: Array<Core.Authorization.ConcreteToken>
  ): boolean;

  abstract createPermission(
    resourceObject: { [key: string]: any },
    permissionToken: Core.Authorization.AbstractToken
  ): Core.Authorization.ConcreteToken;
}
