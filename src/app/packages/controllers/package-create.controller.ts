import { inject, injectable } from "inversify";
import { CreatePackageCommand } from "../commands/create-package.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class PackageCreateController {

  constructor(
    @inject(CreatePackageCommand) public readonly createPackageCommand: CreatePackageCommand
  ) {}

  @post<TripBai.Packages.Endpoints.CreatePackage>('/tripbai/packages')
  async createPackage<T extends TripBai.Packages.Endpoints.CreatePackage>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<CreatePackageCommand["execute"]>[0] = Object.create(null)
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
        controller_name: 'PackageCreateController'
      }
    })
  }

}