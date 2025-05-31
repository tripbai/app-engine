import { Core } from "../../core.types";
import { post } from "../../router/decorators";

export class AppAuthController {

  @post<Core.Endpoints.Auth.WithAppAndSecretKey>('/core/authenticate')
  async withAppKeyAndSecretKey<T extends Core.Endpoints.Auth.WithAppAndSecretKey>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    return {
      token: ''
    }
  }

}