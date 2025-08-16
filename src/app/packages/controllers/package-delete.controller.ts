import { inject, injectable } from "inversify";
import { DeletePackageCommand } from "../commands/delete-package.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import * as TripBai from "../../module/types";
import * as Core from "../../../core/module/types";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import { assertNonEmptyString } from "../../../core/utilities/assertValid";

@injectable()
export class PackageDeleteController {
  constructor(
    @inject(DeletePackageCommand)
    private deletePackageCommand: DeletePackageCommand
  ) {}

  @del<TripBai.Packages.Endpoints.DeletePackage>(
    "/tripbai/packages/:package_id"
  )
  async deletePackage<T extends TripBai.Packages.Endpoints.DeletePackage>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<DeletePackageCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
      assertNonEmptyString(params.data.package_id);
      assertValidEntityId(params.data.package_id);
      commandDTO.packageId = params.data.package_id;
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    await this.deletePackageCommand.execute({
      requester: params.requester,
      packageId: params.data.package_id,
    });
    return {};
  }
}
