import { inject, injectable } from "inversify";
import { patch } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { UpdateUserInternalCommand } from "../commands/update-user-internal.command";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import {
  assertIsFirstName,
  assertIsLastName,
} from "../../profiles/profile.assertions";
import { assertIsEmailAddress, assertIsUsername } from "../user.assertions";
import { assertBooleanValue } from "../../../core/utilities/assertValid";

@injectable()
export class UserUpdateInternalController {
  constructor(
    @inject(UpdateUserInternalCommand)
    private readonly updateUserInternalCommand: UpdateUserInternalCommand
  ) {}

  @patch<IdentityAuthority.Users.Endpoints.InternalUserUpdate>(
    "/identity-authority/update/user"
  )
  async updateUserInternal<
    T extends IdentityAuthority.Users.Endpoints.InternalUserUpdate
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const commandParams: Parameters<UpdateUserInternalCommand["execute"]>[2] =
      Object.create(null);
    try {
      assertValidEntityId(params.data.user_id);
      if (params.data.first_name) {
        assertIsFirstName(params.data.first_name);
        commandParams.first_name = params.data.first_name;
      }
      if (params.data.last_name) {
        assertIsLastName(params.data.last_name);
        commandParams.last_name = params.data.last_name;
      }
      if (params.data.email_address) {
        assertIsEmailAddress(params.data.email_address);
        commandParams.email_address = params.data.email_address;
      }
      if (params.data.username) {
        assertIsUsername(params.data.username);
        commandParams.username = params.data.username;
      }
      if (params.data.is_email_verified) {
        assertBooleanValue(params.data.is_email_verified);
        commandParams.is_email_verified = params.data.is_email_verified;
      }
    } catch (error) {
      throw new BadRequestException({
        message: "invalid user update params",
        data: params.data,
      });
    }
    await this.updateUserInternalCommand.execute(
      params.data.user_id,
      params.requester,
      commandParams
    );
    return {};
  }
}
