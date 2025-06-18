import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { LogicException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { PackageUpdateService } from "../services/package-update.service";
import { PackageRepository } from "../package.repository";
import { PackageUpdatedEvent } from "../package.events";

@injectable()
export class UpdatePackageCommand {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(PackageRepository) public readonly packageRepository: PackageRepository,
    @inject(PackageUpdateService) public readonly packageUpdateService: PackageUpdateService,
    @inject(AbstractEventManagerProvider) public readonly abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester
    packageId: Core.Entity.Id
    name?: string
    isActive?: boolean
    isDefault?: boolean
  }) {
    const unitOfWork = this.unitOfWorkFactory.create()
    const requester = this.organizationRequesterFactory.create(params.requester)
    if (!requester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: 'You do not have permission to update packages',
        data: { }
      })
    }
    const packageModel = await this.packageRepository.getById(params.packageId)
    await this.packageUpdateService.updatePackage(
      unitOfWork, packageModel, params
    )
    await unitOfWork.commit()
    await this.abstractEventManagerProvider.dispatch(
      new PackageUpdatedEvent, packageModel
    )
    return packageModel
  }

}
