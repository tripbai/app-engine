import { inject, injectable } from "inversify";
import { GetPackageQuery } from "../queries/get-package.query";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class PackageGetController {

  constructor(
    @inject(GetPackageQuery) public readonly getPackageQuery: GetPackageQuery
  ) {}

  @get<TripBai.Packages.Endpoints.GetPackage>('/tripbai/packages/:package_id')
  async getPackage<T extends TripBai.Packages.Endpoints.GetPackage>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<GetPackageQuery["execute"]>[0] = Object.create(null)
    commandDTO.requester = params.requester
    try {
      IsValid.NonEmptyString(params.data.package_id)
      EntityToolkit.Assert.idIsValid(params.data.package_id)
      commandDTO.packageId = params.data.package_id
    } catch (error) {
      throw new BadRequestException({
        message: 'request failed due to invalid params',
        data: { error }
      })
    }
    const packageModel = await this.getPackageQuery.execute(commandDTO)
    return {
      entity_id: packageModel.entity_id,
      name: packageModel.name,
      created_at: packageModel.created_at,
      updated_at: packageModel.updated_at,
      is_active: packageModel.is_active,
      is_default: packageModel.is_default
    }
  }

}