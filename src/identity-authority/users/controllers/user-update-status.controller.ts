import { inject, injectable } from "inversify";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { post } from "../../../core/router/decorators";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { stat } from "fs";
import { UserAssertions } from "../user.assertions";
import { TimeStamp } from "../../../core/helpers/timestamp";
import { UpdateUserStatusCommand } from "../commands/update-user-status.command";

@injectable()
export class UserUpdateStatusController {

  constructor(
    @inject(UserAssertions) public readonly userAssertions: UserAssertions,
    @inject(UpdateUserStatusCommand) public readonly updateUserStatusCommand: UpdateUserStatusCommand
  ) {}
  
  @post<IdentityAuthority.Users.Endpoints.UpdateUserStatus>('/identity-authority/user/moderate/status')
  async updateStatus<T extends IdentityAuthority.Users.Endpoints.UpdateUserStatus>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {

    const dto: {
      user_id: Core.Entity.Id
      status: IdentityAuthority.Users.Status.Type
      suspended_until?: string
    } = Object.create(null)

    try {
      IsValid.NonEmptyString(params.data.user_id)
      EntityToolkit.Assert.idIsValid(params.data.user_id)
      dto.user_id = params.data.user_id

      IsValid.NonEmptyString(params.data.status)
      this.userAssertions.isStatus(params.data.status)
      dto.status = params.data.status

      if (params.data.status === 'suspended') {
        if (!('suspended_until' in params.data)) {
          throw new Error('Missing suspended_until field for suspended status')
        }
        IsValid.NonEmptyString(params.data.suspended_until)
        TimeStamp.isValid(params.data.suspended_until)
        dto.suspended_until = params.data.suspended_until
      }

    } catch (error) {
      throw new BadRequestException({
        message: 'invalid user id or status',
        data: { user_id: params.data.user_id, status: params.data.status }
      })
    }

    await this.updateUserStatusCommand.execute(
      params.requester, dto
    )

    return {}

  }

}