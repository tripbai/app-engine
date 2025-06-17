import { inject, injectable } from "inversify";
import { TenantModel } from "../tenant.model";
import { IAuthRequester } from "../../requester/iauth-requester";
import { UserAccessRegistry } from "../../teams/user-access.registry";
import { BadRequestException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { Core } from "../../../core/module/module";
import { IAuthImageTokenService } from "../../services/image-token.service";
import { TenantImagesService } from "./tenant-images.service";
import { TenantValidator } from "../tenant.validator";

@injectable()
export class TenantUpdateService {

  constructor(
    @inject(UserAccessRegistry) public readonly userAccessRegistry: UserAccessRegistry,
    @inject(TenantImagesService) public readonly tenantImagesService: TenantImagesService
  ) {}
  
  /**
   * Update the name of a tenant.
   * @param tenantModelToUpdate 
   * @param name 
   */
  async updateTenantName(
    tenantModelToUpdate: TenantModel,
    name: string
  ){
    try {
      TenantValidator.name(name)
    } catch (error) {
      throw new BadRequestException({
        message: 'invalid tenant name provided for update',
        data: { tenant_id: tenantModelToUpdate.entity_id, error }
      })
    }
    tenantModelToUpdate.name = name
  }

  /**
   * Assert that the requester is the owner of the tenant.
   * @param iAuthRequester 
   * @param tenantModelToUpdate 
   */
  async assertRequesterCanUpdateTenant(
    iAuthRequester: IAuthRequester,
    tenantModelToUpdate: TenantModel
  ){
    const isUserOwnerOfTenant = await this.userAccessRegistry.isUserOwnerOfTenant({
      userId: iAuthRequester.get().user.entity_id,
      tenantId: tenantModelToUpdate.entity_id
    })
    if (!isUserOwnerOfTenant) {
      throw new ResourceAccessForbiddenException({
        message: 'only tenant owner can update tenant at this time',
        data: { requester: iAuthRequester, tenant_id: tenantModelToUpdate.entity_id }
      })
    }
  }

  /**
   * Assert that the tenant is active (not archived).
   * @param tenantModelToUpdate 
   */
  async assertTenantIsActive(
    tenantModelToUpdate: TenantModel
  ) {
    if (tenantModelToUpdate.archived_at !== null) {
      throw new ResourceAccessForbiddenException({
        message: 'tenant is not active',
        data: { tenant_id: tenantModelToUpdate.entity_id }
      })
    }
  }

  /**
   * Update the tenant profile photo using the upload token.
   * @param tenantModelToUpdate 
   * @param uploadToken 
   */
  async updateTenantProfilePhotoUsingToken(
    tenantModelToUpdate: TenantModel,
    uploadToken: string
  ) {
    const tokenPayload = this.tenantImagesService.parseUploadToken(
      tenantModelToUpdate.entity_id,
      uploadToken
    )
    if (tokenPayload.type !== 'profile_photo') {
      throw new ResourceAccessForbiddenException({
        message: 'invalid token type for tenant profile photo update',
        data: { tenant_id: tenantModelToUpdate.entity_id }
      })
    }
    tenantModelToUpdate.profile_photo = tokenPayload.image_path
  }

  /**
   * Update the tenant cover photo using the upload token.
   * @param iAuthRequester 
   * @param tenantModelToUpdate 
   * @param uploadToken 
   */
  async updateTenantCoverPhotoUsingToken(
    tenantModelToUpdate: TenantModel,
    uploadToken: string
  ) {
    const tokenPayload = this.tenantImagesService.parseUploadToken(
      tenantModelToUpdate.entity_id,
      uploadToken
    )
    if (tokenPayload.type !== 'cover_photo') {
      throw new ResourceAccessForbiddenException({
        message: 'invalid token type for tenant cover photo update',
        data: { tenant_id: tenantModelToUpdate.entity_id }
      })
    }
    tenantModelToUpdate.cover_photo = tokenPayload.image_path
  }

}