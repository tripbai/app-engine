import { inject, injectable } from "inversify";
import { CreateFeatureOverrideCommand } from "../commands/create-feature-override.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class FeatureOverrideCreateController {

  constructor(
    @inject(CreateFeatureOverrideCommand) public readonly createFeatureOverrideCommand: CreateFeatureOverrideCommand
  ) {}

  @post<TripBai.Features.Endpoints.CreateFeatureOverride>('/tripbai/features/overrides')
  async createFeatureOverride<T extends TripBai.Features.Endpoints.CreateFeatureOverride>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<CreateFeatureOverrideCommand["execute"]>[0] = Object.create(null)
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
        controller_name: 'FeatureOverrideCreateController'
      }
    })
  }

}