import { inject, injectable } from "inversify";
import { CreatePackageCommand } from "../commands/create-package.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { PackageValidator } from "../package.validator";

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
      IsValid.NonEmptyString(params.data.name)
      PackageValidator.name(params.data.name)
      commandDTO.name = params.data.name
    } catch (error) {
      throw new BadRequestException({
        message: 'request failed due to invalid params',
        data: { error }
      })
    }
    const data = await this.createPackageCommand.execute(commandDTO)
    return {
      entity_id: data.entityId
    }
  }

}