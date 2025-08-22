import { inject, injectable } from "inversify";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { post } from "../../../core/router/route-decorators";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { stat } from "fs";
import { UpdateUserStatusCommand } from "../commands/update-user-status.command";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import { assertIsStatus } from "../user.assertions";
import { assertNonEmptyString } from "../../../core/utilities/assertValid";
import { isValidTimestamp } from "../../../core/utilities/timestamp";

@injectable()
export class UserUpdateStatusController {
  constructor(
    @inject(UpdateUserStatusCommand)
    private updateUserStatusCommand: UpdateUserStatusCommand
  ) {}

  @post<IdentityAuthority.Users.Endpoints.UpdateUserStatus>(
    "/identity-authority/user/moderate/status"
  )
  async updateStatus<
    T extends IdentityAuthority.Users.Endpoints.UpdateUserStatus
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const dto: {
      user_id: Core.Entity.Id;
      status: IdentityAuthority.Users.Status.Type;
      suspended_until?: string;
    } = Object.create(null);

    try {
      assertValidEntityId(params.data.user_id);
      dto.user_id = params.data.user_id;

      assertIsStatus(params.data.status);
      dto.status = params.data.status;

      if (params.data.status === "suspended") {
        if (!("suspended_until" in params.data)) {
          throw new Error("Missing suspended_until field for suspended status");
        }
        assertNonEmptyString(params.data.suspended_until);
        isValidTimestamp(params.data.suspended_until);
        dto.suspended_until = params.data.suspended_until;
      }
    } catch (error) {
      throw new BadRequestException({
        message: "invalid user id or status",
        data: { user_id: params.data.user_id, status: params.data.status },
      });
    }

    await this.updateUserStatusCommand.execute(params.requester, dto);

    return {};
  }
}
