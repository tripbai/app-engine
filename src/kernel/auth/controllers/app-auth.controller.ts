import { BadRequestException } from "../../exceptions/exceptions";
import { IsValid } from "../../helpers/isvalid";
import { Route } from "../../interface";
import { Auth } from "../routes";
import { AppTokenService } from "../services/app-token.service";

export namespace AppAuthController {
  export const generateTokenUsingAppAndSecretKey: Route.Handler<
    Auth.Endpoints.GenerateTokenUsingAppAndSecretKey
  > = async (params) => {
    try {
      IsValid.NonEmptyString(params.data.app_key)
      IsValid.NonEmptyString(params.data.secret_key)
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
        data: {
          app_key: params.data.app_key,
          secret_key: params.data.secret_key
        }
      })
    }
    const token 
      = AppTokenService.GenerateTokenOptions.usingAppAndSecretKey(
        params.data.app_key,
        params.data.secret_key
      )
    return {
      token: token
    }
  }
}