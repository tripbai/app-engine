import { inject, injectable } from "inversify";
import { UpdateUserRoleCommand } from "../commands/update-user-role.command";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { post } from "../../../core/router/route-decorators";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import { assertNonEmptyString } from "../../../core/utilities/assertValid";
import { assertIsRole } from "../user.assertions";

@injectable()
export class UserUpdateRoleController {
  constructor(
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
      assertValidEntityId(params.data.user_id);
      dto.user_id = params.data.user_id;

      assertNonEmptyString(params.data.role);
      assertIsRole(params.data.role);
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
