import { inject, injectable } from "inversify";
import { Core } from "../../core.types";
import { post } from "../../router/decorators";
import { IsValid } from "../../helpers/isvalid";
import { BadRequestException } from "../../exceptions/exceptions";
import { AppAuthService } from "../services/app-auth-service";

@injectable()
export class AppAuthController {

  constructor(
    @inject(AppAuthService) public readonly AppAuthService: AppAuthService
  ){

  }

  @post<Core.Endpoints.Auth.WithAppAndSecretKey>('/core/authenticate')
  async withAppKeyAndSecretKey<T extends Core.Endpoints.Auth.WithAppAndSecretKey>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    try {
      IsValid.NonEmptyString(params.data.app_key)
      IsValid.NonEmptyString(params.data.secret_key)
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
        data: params.data
      })
    }
    this.AppAuthService.validateCredentials(
      params.data.app_key,
      params.data.secret_key
    )
    const token = this.AppAuthService.generateApplicationToken()
    return {
      token: token
    }
  }

}