import { inject, injectable } from "inversify";
import { GetPackageQuery } from "../queries/get-package.query";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

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
    
    } catch (error) {
      throw new BadRequestException({
        message: 'request failed due to invalid params',
        data: { error }
      })
    }
    throw new LogicException({
      message: 'This controller is not implemented yet',
      data: {
        controller_name: 'PackageGetController'
      }
    })
  }

}