import { inject, injectable } from "inversify";
import { UpdatePackageCommand } from "../commands/update-package.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import { TripBai } from "../../module/module.interface";
import * as Core from "../../../core/module/types";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { PackageValidator } from "../package.validator";

@injectable()
export class PackageUpdateController {
  constructor(
    @inject(UpdatePackageCommand)
    private updatePackageCommand: UpdatePackageCommand
  ) {}

  @put<TripBai.Packages.Endpoints.UpdatePackage>(
    "/tripbai/packages/:package_id"
  )
  async updatePackage<T extends TripBai.Packages.Endpoints.UpdatePackage>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<UpdatePackageCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
      assertNonEmptyString(params.data.package_id);
      assertValidEntityId(params.data.package_id);
      commandDTO.packageId = params.data.package_id;

      if (params.data.name) {
        assertNonEmptyString(params.data.name);
        PackageValidator.name(params.data.name);
        commandDTO.name = params.data.name;
      }

      if (params.data.is_active !== undefined) {
        IsValid.BooleanValue(params.data.is_active);
        commandDTO.isActive = params.data.is_active;
      }

      if (params.data.is_default !== undefined) {
        IsValid.BooleanValue(params.data.is_default);
        commandDTO.isDefault = params.data.is_default;
      }
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    const packageModel = await this.updatePackageCommand.execute(commandDTO);
    return {};
  }
}
