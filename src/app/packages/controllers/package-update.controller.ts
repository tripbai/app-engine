import { inject, injectable } from "inversify";
import { UpdatePackageCommand } from "../commands/update-package.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class PackageUpdateController {

  constructor(
    @inject(UpdatePackageCommand) public readonly updatePackageCommand: UpdatePackageCommand
  ) {}

  @put<TripBai.Packages.Endpoints.UpdatePackage>('/tripbai/packages/:package_id')
  async updatePackage<T extends TripBai.Packages.Endpoints.UpdatePackage>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<UpdatePackageCommand["execute"]>[0] = Object.create(null)
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
        controller_name: 'PackageUpdateController'
      }
    })
  }

}