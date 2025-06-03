import { inject, injectable } from "inversify";
import { AppENV } from "../../helpers/env";
import { ResourceAccessForbiddenException, UnauthorizedAccessException } from "../../exceptions/exceptions";
import { RequesterTokenService } from "../../requester/requester-token.service";
import { PermissionManager } from "../../services/rbac/permissions.manager";
import { PermissionTokenValidator } from "../../services/rbac/permission-token.validator";
import { AbstractAuthorizationProvider } from "../../providers/authorization/authorization.provider";
import { Core } from "../../module/module";

@injectable()
export class AppAuthService {

  constructor(
    @inject(RequesterTokenService) public readonly RequesterTokenService: RequesterTokenService,
    @inject(PermissionManager) public readonly PermissionManager: PermissionManager,
    @inject(PermissionTokenValidator) public readonly PermissionTokenValidator: PermissionTokenValidator,
    @inject(AbstractAuthorizationProvider) public readonly AuthorizationProvider: AbstractAuthorizationProvider
  ){}

  validateCredentials(appKey: string, secretKey: string){
    const envAppKey = AppENV.get('APP_KEY')
    if (appKey !== envAppKey) {
      throw new UnauthorizedAccessException({
        message: 'invalid app key',
        data: {app_key: appKey}
      })
    }
    const envSecretKey = AppENV.get('SECRET_KEY')
    if (secretKey !== envSecretKey) {
      throw new UnauthorizedAccessException({
        message: 'invalid secret key',
        data: {app_key: appKey}
      })
    }
  }

  generateApplicationToken(){
    const abstractPermission = `kernel:{access}`
    this.PermissionTokenValidator.isAbstract(abstractPermission)
    const concretePermission = this.PermissionManager.populate(
      abstractPermission, 
      {access: '*'}
    )
    return this.RequesterTokenService.generate({
      user: {id: 'application', status: 'active'},
      permissions: [concretePermission]
    })
  }

  hasHighestPermission(requester: Core.Authorization.Requester): boolean {
    const requiredPermission = `kernel:*`
    this.PermissionTokenValidator.isConcrete(requiredPermission)
    if (!this.PermissionManager.satisfies(requester.permissions, requiredPermission)) {
      throw new ResourceAccessForbiddenException({
        message: 'insufficient application-level permission',
        data: {}
      })
    }
    return true
  }

}