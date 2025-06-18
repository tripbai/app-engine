import { inject, injectable } from "inversify";
import { GetPackagesQuery } from "../queries/get-packages.query";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class PackagesGetController {

  constructor(
    @inject(GetPackagesQuery) public readonly getPackagesQuery: GetPackagesQuery
  ) {}

  @get<TripBai.Packages.Endpoints.GetPackages>('/tripbai/packages')
  async getPackages<T extends TripBai.Packages.Endpoints.GetPackages>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<GetPackagesQuery["execute"]>[0] = Object.create(null)
    commandDTO.requester = params.requester
    try {
    
    } catch (error) {
      throw new BadRequestException({
        message: 'request failed due to invalid params',
        data: { error }
      })
    }
    const packages = await this.getPackagesQuery.execute(commandDTO)
    return packages.map(pkg => ({
      entity_id: pkg.entity_id,
      name: pkg.name,
      created_at: pkg.created_at,
      updated_at: pkg.updated_at,
      is_active: pkg.is_active,
      is_default: pkg.is_default
    }))
  }

}