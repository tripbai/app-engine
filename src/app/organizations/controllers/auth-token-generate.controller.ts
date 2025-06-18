import { inject, injectable } from "inversify";
import { GenerateAuthTokenCommand } from "../commands/generate-auth-token.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class AuthTokenGenerateController {

  constructor(
    @inject(GenerateAuthTokenCommand) public readonly generateAuthTokenCommand: GenerateAuthTokenCommand
  ) {}

  @post<TripBai.Organizations.Endpoints.GenerateAuthToken>('/tripbai/organizations/:organization_id/tokens')
  async generateAuthToken<T extends TripBai.Organizations.Endpoints.GenerateAuthToken>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<GenerateAuthTokenCommand["execute"]>[0] = Object.create(null)
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
        controller_name: 'AuthTokenGenerateController'
      }
    })
  }

}