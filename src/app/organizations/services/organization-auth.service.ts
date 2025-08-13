import { inject, injectable } from "inversify";
import { OrganizationIAuthTokenService } from "./organization-iauth-token.service";
import { OrganizationRepository } from "../organization.repository";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { StoreOrganizationRegistry } from "../../stores/store-organization.registry";
import { Core } from "../../../core/module/module";
import { UserStoreAccessRegistry } from "../../access-directory/user-store-access.registry";
import { StoreModel } from "../../stores/store.model";
import { OrganizationPermissionService } from "./organization-permission.service";
import { RequesterTokenService } from "../../../core/requester/requester-token.service";
import { OrganizationRequester } from "../../requester/organization-requester";
import { Return } from "aws-sdk/clients/cloudsearchdomain";

@injectable()
export class OrganizationAuthService {

  constructor(
    @inject(OrganizationIAuthTokenService) public readonly organizationIAuthTokenService: OrganizationIAuthTokenService,
    @inject(OrganizationRepository) public readonly organizationRepository: OrganizationRepository,
    @inject(StoreOrganizationRegistry) public readonly storeOrganizationRegistry: StoreOrganizationRegistry,
    @inject(UserStoreAccessRegistry) public readonly userStoreAccessRegistry: UserStoreAccessRegistry,
    @inject(OrganizationPermissionService) public readonly organizationPermissionService: OrganizationPermissionService,
    @inject(RequesterTokenService) public readonly requesterTokenService: RequesterTokenService
  ) {}


  /**
   * Exchanges an IAuth token for an organization token.
   * @param params 
   * @returns 
   */
  async exchangeIAuthTokenToOrganizationToken(params: {
    organizationRequester: OrganizationRequester,
    iAuthCertificationToken: string
  }){
    await this.assertRequesterMatchesCertifiedUser (
      params.organizationRequester,
      params.iAuthCertificationToken
    )
    const payload = await this.organizationIAuthTokenService.parseToken(params.iAuthCertificationToken)
    const userId = payload.user_id
    const tenantId = payload.tenant_id
    const organizationModel = await this.organizationRepository.getById(tenantId)
    if (organizationModel.status !== 'active') {
      throw new ResourceAccessForbiddenException({
        message: `Organization is not active.`,
        data: { organization_id: tenantId }
      })
    }
    if (payload.is_owner) {
      // If the user is an owner, they have access to all active stores in the organization
      return this.handleOwnerAccess({
        userId: userId,
        tenantId: tenantId,
        userStatus: params.organizationRequester.getStatus()
      })
    }
    const allActiveStoresInOrg = await this.storeOrganizationRegistry.getActiveStoresByOrganizationId(tenantId)
    // If the user is not an owner, we need to check if they have access to any stores
    // within the organization
    const storeIdsUserHasAccessTo = await this.filterStoreIdsUserHaveAccessTo({
      userId: userId,
      activeStoresInOrg: allActiveStoresInOrg
    })
    if (storeIdsUserHasAccessTo.length === 0) {
      throw new ResourceAccessForbiddenException({
        message: `User does not have access to any stores in this organization.`,
        data: { user_id: userId, organization_id: tenantId }
      })
    }
    // Generate permissions for each store the user has access to
    const permissions = storeIdsUserHasAccessTo.map(storeAccess => {
      return this.organizationPermissionService.createStoreLevelPermission({
        organizationId: tenantId, storeId: storeAccess.store_id
      })
    })
    return this.requesterTokenService.generate({
      user: { id: userId, status: params.organizationRequester.getStatus() },
      permissions: permissions
    })
  }

  handleOwnerAccess(params: {
    userId: Core.Entity.Id,
    tenantId: Core.Entity.Id,
    userStatus: ReturnType<OrganizationRequester['getStatus']>
  }){
    const permissions = this.makeOrgOwnerAdminPermissionsForAllStores(params.tenantId)
    return this.requesterTokenService.generate({
      user: { id: params.userId, status: params.userStatus },
      permissions: [permissions]
    })
  }

  /**
   * Checks if the requester is the same person who is certified by the IAuth token.
   * @param organizationRequester 
   * @param iAuthCertificationToken 
   * @returns 
   */
  async assertRequesterMatchesCertifiedUser (
    organizationRequester: OrganizationRequester,
    iAuthCertificationToken: string
  ) {
    const payload = await this.organizationIAuthTokenService.parseToken(iAuthCertificationToken)
    if (organizationRequester.getUserId() !== payload.user_id) {
      throw new ResourceAccessForbiddenException({
        message: `Requester is not the same person who is certified by the IAuth token.`,
        data: {
          requester_id: organizationRequester.getUserId(),
          iAuthCertificationToken: iAuthCertificationToken
        }
      })
    }
  }

  /**
   * Creates organization-level permissions for an owner admin.
   * @param organizationId 
   * @returns 
   */
  makeOrgOwnerAdminPermissionsForAllStores(organizationId: Core.Entity.Id) {
    return this.organizationPermissionService.createOrganizationLevelPermission(organizationId)
  }

  /**
   * Filters the store IDs that a user has access to, based on the active stores in the organization.
   * @param params 
   * @returns 
   */
  async filterStoreIdsUserHaveAccessTo(params: {
    userId: Core.Entity.Id
    activeStoresInOrg: Array<StoreModel>
  }){
    const allStoresUserHaveAccessTo = await this.userStoreAccessRegistry.getStoreIdsUserHasAccess(params.userId)
    return allStoresUserHaveAccessTo.filter(storeAccess => {
      return params.activeStoresInOrg.some(store => {
        return store.entity_id === storeAccess.store_id
      })
    })
  }

}