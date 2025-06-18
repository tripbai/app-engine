import { inject, injectable } from "inversify";
import { AbstractAuthorizationProvider } from "../../../core/providers/authorization/authorization.provider";
import { Core } from "../../../core/module/module";

@injectable()
export class OrganizationPermissionService {

  constructor(
    @inject(AbstractAuthorizationProvider) public readonly abstractAuthorizationProvider: AbstractAuthorizationProvider
  ) {}

  createStoreLevelPermission(
    organizationId: Core.Entity.Id, 
    storeId: Core.Entity.Id
  ) {
    return this.abstractAuthorizationProvider.createPermission(
      { organization_id: organizationId, store_id: storeId },
      this.getStoreLevelLikePermission()
    )
  }

  createOrganizationLevelPermission(
    organizationId: Core.Entity.Id
  ) {
    return this.abstractAuthorizationProvider.createPermission(
      { organization_id: organizationId },
      this.getOrganizationLevelLikePermission()
    )
  }

  getStoreLevelLikePermission() {
    return 'organizations:{organization_id}:stores:{store_id}' as Core.Authorization.AbstractToken;
  }

  getOrganizationLevelLikePermission(){
    return 'organizations:{organization_id}' as Core.Authorization.AbstractToken;
  }

  hasPermissionToOperateThisOrganization(
    organizationId: Core.Entity.Id,
    requesterPermissions: Array<Core.Authorization.ConcreteToken>
  ) {
    return this.abstractAuthorizationProvider.canOperate(
      { organization_id: organizationId },
      this.getOrganizationLevelLikePermission(),
      requesterPermissions
    )
  }

  hasPermissionToOperateThisStore(
    storeId: Core.Entity.Id,
    organizationId: Core.Entity.Id,
    requesterPermissions: Array<Core.Authorization.ConcreteToken>
  ){
    return this.abstractAuthorizationProvider.canOperate(
      { organization_id: organizationId, store_id: storeId },
      this.getStoreLevelLikePermission(),
      requesterPermissions
    )
  }

  isOneOfThePermissionsAdminLike(
    grantedPermissions: Array<Core.Authorization.ConcreteToken>,
  ){
    return this.abstractAuthorizationProvider.canOperate(
      {domain: '*'},
      this.getWebAdminLikePermission(),
      grantedPermissions
    )
  }

  getWebAdminPermission(){
    return this.abstractAuthorizationProvider.createPermission(
      {domain: '*'},
      this.getWebAdminLikePermission()
    )
  }

  getWebAdminLikePermission(){
    return 'iauth:{domain}' as Core.Authorization.AbstractToken
  }

}