import { LogicException, UnauthorizedAccessException } from "../../exceptions/exceptions"
import { AppENV } from "../../helpers/env"
import { PermissionTokenAsserter } from "../../rbac/assertions"
import { RequesterToken } from "../../rbac/token"

export namespace AppTokenService {

  export namespace GenerateTokenOptions {

    export const usingAppAndSecretKey = (appKey: string, secretKey: string) => {

      const envAppKey = AppENV.get('APP_KEY')
      if (appKey !== envAppKey) {
        throw new UnauthorizedAccessException({
          message: 'invalid app key',
          data: { app_key: appKey }
        })
      }

      const envSecretKey = AppENV.get('SECRET_KEY')

      if (secretKey !== envSecretKey) {
        throw new UnauthorizedAccessException({
          message: 'invalid secret key',
          data: { app_key: appKey }
        })
      }

      const grantedPermission = 'kernel:*'
      try {
        PermissionTokenAsserter.isConcrete(grantedPermission)
      } catch (error) {
        throw new LogicException({
          message: error.message,
          data: {
            permission: grantedPermission
          }
        })
      }

      const data = {
        user: {
          id: 'kernel', 
          status: 'active'
        }, 
        permissions: [grantedPermission]
      }
    
      return RequesterToken.generate(data)

    }

  }

}