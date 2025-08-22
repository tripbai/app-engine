import { inject, injectable } from "inversify";
import { GenerateAuthTokenCommand } from "../commands/generate-auth-token.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import * as TripBai from "../../module/types";
import * as Core from "../../../core/module/types";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";
import { assertNonEmptyString } from "../../../core/utilities/assertValid";

@injectable()
export class AuthTokenGenerateController {
  constructor(
    @inject(GenerateAuthTokenCommand)
    private generateAuthTokenCommand: GenerateAuthTokenCommand
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
      assertNonEmptyString(params.data.tenant_access_certification_token);
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
