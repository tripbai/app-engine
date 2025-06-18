import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { PackageGetService } from "../services/package-get.service";
import { PackageRepository } from "../package.repository";

@injectable()
export class GetPackagesQuery {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(PackageRepository) public readonly packageRepository: PackageRepository,
    @inject(PackageGetService) public readonly packageGetService: PackageGetService,
    @inject(AbstractEventManagerProvider) public readonly abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester
  }) {
    const unitOfWork = this.unitOfWorkFactory.create()
    const requester = this.organizationRequesterFactory.create(params.requester)
    if (!requester.isWebAdmin()) {
      throw new LogicException({
        message: 'You do not have permission to access this resource',
        data: {}
      })
    }
    const packages = await this.packageRepository.getAllNonArchivedPackages()
    return packages
  }

}
