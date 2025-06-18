import { inject, injectable } from "inversify";
import { DeletePackageCommand } from "../commands/delete-package.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class PackageDeleteController {

  constructor(
    @inject(DeletePackageCommand) public readonly deletePackageCommand: DeletePackageCommand
  ) {}

  @del<TripBai.Packages.Endpoints.DeletePackage>('/tripbai/packages/:package_id')
  async deletePackage<T extends TripBai.Packages.Endpoints.DeletePackage>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<DeletePackageCommand["execute"]>[0] = Object.create(null)
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
        controller_name: 'PackageDeleteController'
      }
    })
  }

}