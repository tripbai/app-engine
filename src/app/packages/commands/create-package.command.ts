import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { PackageCreateService } from "../services/package-create.service";
import { PackageRepository } from "../package.repository";
import { PackageCreatedEvent } from "../package.events";

@injectable()
export class CreatePackageCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(PackageRepository)
    private packageRepository: PackageRepository,
    @inject(PackageCreateService)
    private packageCreateService: PackageCreateService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    name: string;
  }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const packageModel = this.packageCreateService.createPackage(
      this.organizationRequesterFactory.create(params.requester),
      params.name
    );
    unitOfWork.addTransactionStep(
      this.packageRepository.create(packageModel.entity_id, {
        name: packageModel.name,
        is_active: packageModel.is_active,
        is_default: packageModel.is_default,
        archived_at: packageModel.archived_at,
      })
    );
    await unitOfWork.commit();
    await this.abstractEventManagerProvider.dispatch(
      new PackageCreatedEvent(),
      packageModel
    );
    return {
      entityId: packageModel.entity_id,
    };
  }
}
