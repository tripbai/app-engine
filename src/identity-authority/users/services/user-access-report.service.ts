import { inject, injectable } from "inversify";
import { IdentityAuthority } from "../../module/module.interface";
import { BadRequestException, LogicException, RecordNotFoundException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { UserRepository } from "../user.repository";
import { UserPasswordService } from "./user-password.service";
import { UserModel } from "../user.model";
import { UserPermissionService } from "./user-permission.service";
import { Core } from "../../../core/module/module";
import { RequesterTokenService } from "../../../core/requester/requester-token.service";
import { UserAuthService } from "./user-auth.service";

@injectable()
export class UserAccessReportService {

  constructor(
    @inject(UserRepository) public readonly userRepository: UserRepository,
    @inject(UserAuthService) public readonly userAuthService: UserAuthService,
    @inject(UserPermissionService) public readonly userPermissionService: UserPermissionService,
    @inject(RequesterTokenService) public readonly requesterTokenService: RequesterTokenService
  ){}
  
  async createAccessReport(
    params: Omit<IdentityAuthority.Users.Endpoints.AccessReport['request']['data'], 'provider'> &  {
      provider: IdentityAuthority.Providers.Identity
    }
  ): Promise<IdentityAuthority.Users.ApplicationAccess.Report>{

    const userModel = await this.userRepository.getByEmailAddress(params.email_address)
    if (userModel === null) {
      return {
        is_user_registered: false
      }
    }

    /** Asserts that the identity provider is correct */
    this.userAuthService.assertAssignedIdentityProvider(
      userModel, params.provider
    )

    if (userModel.identity_provider === 'iauth') {
      await this.userAuthService.authenticateIAuthUser(
        userModel, params.password
      )
    } else if (userModel.identity_provider === 'fireauth') {
      throw new ResourceAccessForbiddenException({
        message: 'fireauth hosted users cannot use this method',
        data: {user_id: userModel.entity_id}
      })
    } else if (userModel.identity_provider === 'google') {
      throw new ResourceAccessForbiddenException({
        message: 'google hosted users cannot use this method',
        data: {user_id: userModel.entity_id}
      })
    } else {
      throw new LogicException({
        message: 'there may be identity provider that is not yet supported here',
        data: { provider: userModel.identity_provider }
      })
    }


    const permissionTokens: Array<Core.Authorization.ConcreteToken> = []
    this.userPermissionService.addPermissionsByRole(
      permissionTokens, userModel.entity_id, userModel.role
    )
    
    const accessToken = this.requesterTokenService.generate({
      user: { id: userModel.entity_id, status: userModel.status },
      permissions: permissionTokens
    })

    return this.generateStatusBasedReport(
      userModel, accessToken
    )

  }

  generateStatusBasedReport(
    userModel: UserModel,
    accessToken: string
  ): IdentityAuthority.Users.ApplicationAccess.Report {
    
    const status = userModel.status

    if (status === 'banned' || status === 'suspended' ) {
      const prohibited: IdentityAuthority.Users.ApplicationAccess.Prohibited = status 
      return {
        access_type: 'prohibited',
        is_user_registered: true,
        user_id: userModel.entity_id,
        user_status: status
      }
    }

    if (status ==='deactivated' || status==='archived') {
      const limited: IdentityAuthority.Users.ApplicationAccess.Limited = status 
      return {
        access_type: 'limited',
        is_user_registered: true,
        user_status: status,
        token: accessToken,
        user_id: userModel.entity_id
      }
    }

    if (status==='active' || status==='unverified') {
      const allowed: IdentityAuthority.Users.ApplicationAccess.Allowed = status 
      return {
        is_user_registered: true,
        user_id: userModel.entity_id,
        user_status: status,
        token: accessToken,
        access_type: 'allowed'
      }
    }

    const never:never = status

    throw new LogicException({
      message: 'there may be status that is not yet supported',
      data: { status: status }
    })
  }

}