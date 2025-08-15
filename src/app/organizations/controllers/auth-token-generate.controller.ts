import { inject, injectable } from "inversify";
import { GenerateAuthTokenCommand } from "../commands/generate-auth-token.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";

@injectable()
export class AuthTokenGenerateController {
  constructor(
    @inject(GenerateAuthTokenCommand)
    public readonly generateAuthTokenCommand: GenerateAuthTokenCommand
  ) {}

  @post<TripBai.Organizations.Endpoints.GenerateAuthToken>(
    "/tripbai/organizations/:organization_id/tokens"
  )
  async generateAuthToken<
    T extends TripBai.Organizations.Endpoints.GenerateAuthToken
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const commandDTO: Parameters<GenerateAuthTokenCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
      IsValid.NonEmptyString(params.data.tenant_access_certification_token);
      commandDTO.iAuthCertificationToken =
        params.data.tenant_access_certification_token;
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    const token = await this.generateAuthTokenCommand.execute(commandDTO);
    return {
      upgraded_token: token,
    };
  }
}
