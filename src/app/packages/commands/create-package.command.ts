import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { PackageCreateService } from "../services/package-create.service";
import { PackageRepository } from "../package.repository";
import { PackageCreatedEvent } from "../package.events";

@injectable()
export class CreatePackageCommand {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(PackageRepository) public readonly packageRepository: PackageRepository,
    @inject(PackageCreateService) public readonly packageCreateService: PackageCreateService,
    @inject(AbstractEventManagerProvider) public readonly abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester,
    name: string
  }) {
    const unitOfWork = this.unitOfWorkFactory.create()
    const packageModel = this.packageCreateService.createPackage(
      this.organizationRequesterFactory.create(params.requester),
      params.name
    )
    unitOfWork.addTransactionStep(
      this.packageRepository.create(packageModel.entity_id, {
        name: packageModel.name,
        is_active: packageModel.is_active,
        is_default: packageModel.is_default,
        archived_at: packageModel.archived_at
      })
    )
    await unitOfWork.commit()
    await this.abstractEventManagerProvider.dispatch(
      new PackageCreatedEvent, packageModel
    )
    return {
      entityId: packageModel.entity_id
    }
  }

}
