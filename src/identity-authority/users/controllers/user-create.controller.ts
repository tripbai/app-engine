import { inject, injectable } from "inversify";
import { UserCreateService } from "../services/user-create.service";
import { post } from "../../../core/router/decorators";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { UserAssertions } from "../user.assertions";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { ProfileAssertions } from "../../profiles/profile.assertions";
import { CreateUserCommand } from "../commands/create-user.command";

@injectable()
export class UserCreateController {

  constructor(
    @inject(UserCreateService) public readonly userCreateService: UserCreateService,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions,
    @inject(ProfileAssertions) public readonly profileAssertions: ProfileAssertions,
    @inject(CreateUserCommand) public readonly createUserCommand: CreateUserCommand
  ){}

  @post<IdentityAuthority.Users.Endpoints.Create>('/identity-authority/users')
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
      this.userAssertions.isStatus(params.data.status)
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
    
    const response = await this.createUserCommand.execute(
      {
        provider: params.data.provider,
        first_name: params.data.first_name,
        last_name: params.data.last_name,
        username: params.data.username,
        email_address: params.data.email_address,
        password: password,
        type: params.data.type,
        creation_context: params.data.context,
        role: params.data.role,
        status: params.data.status
      }
    )

    return {
      type: response.type,
      context: response.context,
      provider: response.provider,
      role: response.role,
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