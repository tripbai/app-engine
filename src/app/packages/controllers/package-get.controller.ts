import { inject, injectable } from "inversify";
import { GetPackageQuery } from "../queries/get-package.query";
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
import { assertNonEmptyString } from "../../../core/utilities/assertValid";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class PackageGetController {
  constructor(
    @inject(GetPackageQuery) private getPackageQuery: GetPackageQuery
  ) {}

  @get<TripBai.Packages.Endpoints.GetPackage>("/tripbai/packages/:package_id")
  async getPackage<T extends TripBai.Packages.Endpoints.GetPackage>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<GetPackageQuery["execute"]>[0] =
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
    const packageModel = await this.getPackageQuery.execute(commandDTO);
    return {
      entity_id: packageModel.entity_id,
      name: packageModel.name,
      created_at: packageModel.created_at,
      updated_at: packageModel.updated_at,
      is_active: packageModel.is_active,
      is_default: packageModel.is_default,
    };
  }
}
