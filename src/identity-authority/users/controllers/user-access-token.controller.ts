import { inject, injectable } from "inversify";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import { RefreshAccessTokenCommand } from "../commands/refresh-access-token.command";
import * as Core from "../../../core/module/types";

@injectable()
export class UserAccessTokenController {
  constructor(
    @inject(RefreshAccessTokenCommand)
    private refreshAccessTokenCommand: RefreshAccessTokenCommand
  ) {}

  @post<IdentityAuthority.Users.Endpoints.RefreshAccessToken>(
    "/identity-authority/tokens/refresh"
  )
  async refreshAccessToken<
    T extends IdentityAuthority.Users.Endpoints.RefreshAccessToken
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const token = await this.refreshAccessTokenCommand.execute(
      params.requester
    );
    return {
      token: token,
    };
  }
}
