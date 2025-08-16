import { inject, injectable } from "inversify";
import { PackageRepository } from "../package.repository";
import { OrganizationRequester } from "../../requester/organization-requester";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { PackageModel } from "../package.model";
import { createEntityId } from "../../../core/utilities/entityToolkit";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";

@injectable()
export class PackageCreateService {
  constructor(
    @inject(PackageRepository)
    private packageRepository: PackageRepository
  ) {}

  createPackage(
    requester: OrganizationRequester,
    name: string,
    unitOfWork: UnitOfWork
  ): PackageModel {
    if (!requester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "Requester has no permission to create packages.",
        data: { requester: requester },
      });
    }
    const packageModel = this.packageRepository.create(
      {
        name: name,
        is_active: true,
        // Packages are always set as not default when created
        // This is to ensure that there is always at least one default package
        is_default: false,
      },
      unitOfWork
    );
    return packageModel;
  }
}
