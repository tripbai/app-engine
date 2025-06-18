import { inject, injectable } from "inversify";
import { PackageRepository } from "../package.repository";
import { OrganizationRequester } from "../../requester/organization-requester";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { PackageModel } from "../package.model";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { TimeStamp } from "../../../core/helpers/timestamp";

@injectable()
export class PackageCreateService {

  constructor(
    @inject(PackageRepository) public readonly packageRepository: PackageRepository
  ) {}

  createPackage(
    requester: OrganizationRequester,
    name: string,
  ): PackageModel {
    if (!requester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "Requester has no permission to create packages.",
        data: { requester: requester.requester }
      })
    }
    const packageId = Pseudorandom.alphanum32()
    const packageModel: PackageModel = {
      entity_id: packageId,
      name: name,
      is_active: true,
      is_default: false,
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null
    }
    return packageModel
  }

}