import { inject, injectable } from "inversify";
import * as Core from "../../module/types";
import { post } from "../../router/route-decorators";
import { AppAuthService } from "../services/app-auth-service";
import { InvalidArgumentException } from "../../exceptions/exceptions";
import { assertNonEmptyString } from "../../utilities/assertValid";

@injectable()
export class AppAuthController {
  constructor(
    @inject(AppAuthService) public readonly AppAuthService: AppAuthService
  ) {}

  @post<Core.Endpoints.AuthWithAppAndSecretKey>("/core/authenticate")
  async withAppKeyAndSecretKey<
    T extends Core.Endpoints.AuthWithAppAndSecretKey
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertNonEmptyString(params.data.app_key);
      assertNonEmptyString(params.data.secret_key);
    } catch (error) {
      throw new InvalidArgumentException({
        message: error instanceof Error ? error.message : "unknown error",
        data: params.data,
      });
    }
    this.AppAuthService.validateCredentials(
      params.data.app_key,
      params.data.secret_key
    );
    const token = this.AppAuthService.generateApplicationToken();
    return {
      token: token,
    };
  }
}
