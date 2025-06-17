import { inject, injectable } from "inversify";
import { Core } from "../../../core/module/module";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { IAuthImageUploadService } from "../../services/image-upload.service";
import { BadRequestException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { UserAccessRegistry } from "../../teams/user-access.registry";
import { TenantUpdateService } from "../services/tenant-update.service";
import { TenantRepository } from "../tenant.repository";
import { IdentityAuthority } from "../../module/module.interface";
import { IAuthImageTokenService } from "../../services/image-token.service";

@injectable()
export class UploadTenantImagesCommand {

  constructor(
    @inject(IAuthRequesterFactory) private readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(IAuthImageUploadService) private readonly iAuthImageUploadService: IAuthImageUploadService,
    @inject(TenantUpdateService) private readonly tenantUpdateService: TenantUpdateService,
    @inject(TenantRepository) private readonly tenantRepository: TenantRepository,
    @inject(IAuthImageTokenService) private readonly iAuthImageTokenService: IAuthImageTokenService
  ){}

  async execute(
    requester: Core.Authorization.Requester,
    type: 'profile_photo' | 'cover_photo',
    tenantId: Core.Entity.Id,
    fileExtension: IdentityAuthority.Images.SupportedExtensions,
    buffer: Buffer,
  ): Promise<{
    file_path: Core.File.UploadPath,
    upload_token: string
  }>{
    const requesterAuth = this.iAuthRequesterFactory.create(requester);
    if (!requesterAuth.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: 'public users cannot invoke this command',
        data: requester
      });
    }
    const tenantModel = await this.tenantRepository.getById(tenantId)
    this.tenantUpdateService.assertRequesterCanUpdateTenant(
      requesterAuth, tenantModel
    )
    if (type === 'profile_photo') {
      const uploadPath = await this.iAuthImageUploadService.uploadProfilePhoto(
        fileExtension, buffer
      )
      const uploadToken = this.iAuthImageTokenService.generate(
        type, tenantModel.entity_id, uploadPath
      )
      return {
        file_path: uploadPath,
        upload_token: uploadToken
      }
    }
    if (type === 'cover_photo') {
      const uploadPath = await this.iAuthImageUploadService.uploadCoverPhoto(
        fileExtension, buffer
      )
      const uploadToken = this.iAuthImageTokenService.generate(
        type, tenantModel.entity_id, uploadPath
      )
      return {
        file_path: uploadPath,
        upload_token: uploadToken
      }
    }
    throw new BadRequestException({
      message: 'invalid image type provided for upload',
      data: { type, tenant_id: tenantModel.entity_id }
    })
  }

}