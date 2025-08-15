import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import {
  LogicException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { PackageDeleteService } from "../services/package-delete.service";
import { PackageRepository } from "../package.repository";
import { TimeStamp } from "../../../core/helpers/timestamp";
import { PackageDeletedEvent } from "../package.events";

@injectable()
export class DeletePackageCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(PackageRepository)
    private packageRepository: PackageRepository,
    @inject(PackageDeleteService)
    private packageDeleteService: PackageDeleteService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    packageId: Core.Entity.Id;
  }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    if (!requester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "only web admin is allowed to perform this action",
        data: {},
      });
    }
    const packageModel = await this.packageRepository.getById(params.packageId);
    packageModel.archived_at = TimeStamp.now();
    unitOfWork.addTransactionStep(
      await this.packageRepository.update(packageModel)
    );
    await unitOfWork.commit();
    await this.abstractEventManagerProvider.dispatch(
      new PackageDeletedEvent(),
      packageModel
    );
    return {};
  }
}
