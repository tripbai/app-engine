import { inject, injectable } from "inversify";
import { UserCreateService } from "../services/user-create.service";
import { TransactionManager } from "../../../core/transaction/transaction.manager";
import { post } from "../../../core/router/decorators";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { UserAssertions } from "../user.assertions";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { ProfileAssertions } from "../../profiles/profile.assertions";
import { RequesterTokenService } from "../../../core/requester/requester-token.service";
import { UserPermissionService } from "../services/user-permission.service";

@injectable()
export class UserCreateController {

  constructor(
    @inject(UserCreateService) public readonly userCreateService: UserCreateService,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions,
    @inject(ProfileAssertions) public readonly profileAssertions: ProfileAssertions
  ){}

  @post<IdentityAuthority.Users.Endpoints.Create>('/identity-authority/user')
  async create<T extends IdentityAuthority.Users.Endpoints.Create>(params: Core.Route.ControllerDTO<T>): Promise<T['response']>{

    let password: IdentityAuthority.Users.Fields.RawPassword | null = null

    try {

      this.profileAssertions.isFirstName(params.data.first_name)
      this.profileAssertions.isLastName(params.data.last_name)
      this.userAssertions.isUsername(params.data.username)
      this.userAssertions.isEmailAddress(params.data.email_address)
      this.userAssertions.isType(params.data.type)
      this.userAssertions.isCreationContext(params.data.context)
      this.userAssertions.isRole(params.data.role)
      this.userAssertions.isProvider(params.data.provider)
      if ('password' in params.data) {
        this.userAssertions.isRawPassword(params.data.password)
        password = params.data.password
      }

    } catch (error) {
      throw new BadRequestException({
        message: 'create user params validation failed',
        data: params.data
      })
    }
    
    const response = await this.userCreateService.createUser({
      provider: params.data.provider,
      first_name: params.data.first_name,
      last_name: params.data.last_name,
      username: params.data.username,
      email_address: params.data.email_address,
      password: password,
      type: params.data.type,
      creation_context: params.data.context,
      role: params.data.role
    })

    return {
      type: 'concrete',
      context: 'external',
      provider: 'iauth',
      role: 'user',
      user_id: response.user_id,
      first_name: params.data.first_name,
      last_name: params.data.last_name,
      username: response.username,
      email_address: response.email_address,
      status: response.status,
      iauth_token: response.iauth_token
    }
    
  }

}