import { inject, injectable } from "inversify";
import { patch } from "../../../core/router/decorators";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { UserValidator } from "../user.validator";
import { IsValid } from "../../../core/helpers/isvalid";
import { UpdateUserCommand } from "../commands/update-user.command";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { UserAssertions } from "../user.assertions";

@injectable()
export class UserUpdateController {

  constructor(
    @inject(UpdateUserCommand) public readonly updateUserCommand: UpdateUserCommand,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions
  ){

  }

  @patch<IdentityAuthority.Users.Endpoints.UpdateUser>('identity-authority/users/:user_id')
  async updateUserModel<T extends IdentityAuthority.Users.Endpoints.UpdateUser>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    try {

      EntityToolkit.Assert.idIsValid(params.data.user_id)

      IsValid.NonEmptyString(params.data.identity_provider)
      this.userAssertions.isProvider(params.data.identity_provider)
      
    } catch (error) {
      throw new BadRequestException({
        message: 'invalid user update params',
        data: params.data
      })
    }

    params.data.identity_provider

    await this.updateUserCommand.execute(
      params.data.user_id,
      params.requester,
      {
        identity_provider: params.data.identity_provider
      }
    )

  } 

}