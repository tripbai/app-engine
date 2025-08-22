import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import {
  LogicException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { PackageUpdateService } from "../services/package-update.service";
import { PackageRepository } from "../package.repository";
import { PackageUpdatedEvent } from "../package.events";

@injectable()
export class UpdatePackageCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(PackageRepository)
    private packageRepository: PackageRepository,
    @inject(PackageUpdateService)
    private packageUpdateService: PackageUpdateService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    packageId: Core.Entity.Id;
    name?: string;
    isActive?: boolean;
    isDefault?: boolean;
  }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    if (!requester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "You do not have permission to update packages",
        data: {},
      });
    }
    const packageModel = await this.packageRepository.getById(params.packageId);
    const updateParams: Parameters<PackageUpdateService["updatePackage"]>[2] =
      Object.create(null);
    if (params.isActive !== undefined) {
      updateParams.is_active = params.isActive;
    }
    if (params.isDefault !== undefined) {
      updateParams.is_default = params.isDefault;
    }
    if (params.name !== undefined) {
      updateParams.name = params.name;
    }
    await this.packageUpdateService.updatePackage(
      unitOfWork,
      packageModel,
      updateParams
    );
    await unitOfWork.commit();
    await this.abstractEventManagerProvider.dispatch(
      new PackageUpdatedEvent(),
      packageModel
    );
    return packageModel;
  }
}
