import { inject, injectable } from "inversify";
import { UserAssertions } from "../user.assertions";
import { UpdateUserRoleCommand } from "../commands/update-user-role.command";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { post } from "../../../core/router/route-decorators";

@injectable()
export class UserUpdateRoleController {
  constructor(
    @inject(UserAssertions) private userAssertions: UserAssertions,
    @inject(UpdateUserRoleCommand)
    private updateUserRoleCommand: UpdateUserRoleCommand
  ) {}

  @post<IdentityAuthority.Users.Endpoints.UpdateUserRole>(
    "/identity-authority/user/delegate/role"
  )
  async updateRole<T extends IdentityAuthority.Users.Endpoints.UpdateUserRole>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const dto: {
      user_id: Core.Entity.Id;
      newRole: "webadmin" | "user" | "moderator";
    } = Object.create(null);

    try {
      assertNonEmptyString(params.data.user_id);
      assertValidEntityId(params.data.user_id);
      dto.user_id = params.data.user_id;

      assertNonEmptyString(params.data.role);
      this.userAssertions.isRole(params.data.role);
      dto.newRole = params.data.role;
    } catch (error) {
      throw new BadRequestException({
        message: "Invalid user id or role",
        data: { user_id: params.data.user_id, role: params.data.role },
      });
    }

    await this.updateUserRoleCommand.execute(params.requester, dto);

    return {};
  }
}
