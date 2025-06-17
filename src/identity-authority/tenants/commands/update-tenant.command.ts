import { inject, injectable } from "inversify";
import { Core } from "../../../core/module/module";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { IAuthRequester } from "../../requester/iauth-requester";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { TenantRepository } from "../tenant.repository";
import { TenantUpdateEvent } from "../tenant.events";
import { TenantUpdateService } from "../services/tenant-update.service";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";

@injectable()
export class UpdateTenantCommand {

  constructor(
    @inject(UnitOfWorkFactory) private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(IAuthRequesterFactory) private readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(TenantRepository) private readonly tenantRepository: TenantRepository,
    @inject(TenantUpdateService) private readonly tenantUpdateService: TenantUpdateService,
    @inject(AbstractEventManagerProvider) private readonly abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(
    tenantId: Core.Entity.Id,
    requester: Core.Authorization.Requester,
    params: {
      name?: string
      profile_photo?: {
        upload_token: string
      }
      cover_photo?: {
        upload_token: string
      }
    }
  ){
    const unitOfWork = this.unitOfWorkFactory.create()
    const requesterAuth = this.iAuthRequesterFactory.create(requester)
    if (!requesterAuth.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: 'public users cannot invoke this command',
        data: requester
      })
    }
    const tenantModelToUpdate = await this.tenantRepository.getById(tenantId)
    // Check if user has access to the tenant
    try {
      await this.tenantUpdateService.assertRequesterCanUpdateTenant(
        requesterAuth, tenantModelToUpdate
      )
    } catch (error) {
      throw new ResourceAccessForbiddenException({
        message: 'only tenant owner can update tenant at this time',
        data: { requester: requesterAuth, tenant_id: tenantModelToUpdate.entity_id }
      })
    }
    if (params.name) {
      await this.tenantUpdateService.updateTenantName(tenantModelToUpdate, params.name)
    }
    if (params.profile_photo && params.profile_photo.upload_token) {
      await this.tenantUpdateService.updateTenantCoverPhotoUsingToken(
        tenantModelToUpdate, params.profile_photo.upload_token
      )
    }
    if (params.cover_photo && params.cover_photo.upload_token) {
      await this.tenantUpdateService.updateTenantProfilePhotoUsingToken(
        tenantModelToUpdate, params.cover_photo.upload_token
      )
    }
    unitOfWork.addTransactionStep(
      await this.tenantRepository.update(tenantModelToUpdate)
    )
    await unitOfWork.commit()
    await this.abstractEventManagerProvider.dispatch(
      new TenantUpdateEvent, tenantModelToUpdate
    )
    return
  }

}