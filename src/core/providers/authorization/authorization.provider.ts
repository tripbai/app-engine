import { Core } from "../../module/module";

export abstract class AbstractAuthorizationProvider {

  abstract canOperate(
    resourceObject: {[key:string]:any}, 
    requiredPermission: Core.Authorization.AbstractToken,
    grantedPermissions: Array<Core.Authorization.ConcreteToken>
  ): boolean

  abstract grantPermission(
    requester: Core.Authorization.Requester,
    resourceObject: {[key:string]:any},
    permissionToken: Core.Authorization.AbstractToken
  ): void

}