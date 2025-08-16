import { inject, injectable } from "inversify";
import { patch } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { UpdateUserCommand } from "../commands/update-user.command";
import {
  assertIsFirstName,
  assertIsLastName,
  assertIsProfileAbout,
} from "../../profiles/profile.assertions";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import {
  assertIsIdentityProvider,
  assertIsRawPassword,
  assertIsUsername,
  assertIsUserType,
} from "../user.assertions";

@injectable()
export class UserUpdateController {
  constructor(
    @inject(UpdateUserCommand)
    private updateUserCommand: UpdateUserCommand
  ) {}

  @patch<IdentityAuthority.Users.Endpoints.UpdateUser>(
    "/identity-authority/users/:user_id"
  )
  async updateUserModel<T extends IdentityAuthority.Users.Endpoints.UpdateUser>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandParams: Parameters<UpdateUserCommand["execute"]>[2] =
      Object.create(null);

    try {
      assertValidEntityId(params.data.user_id);

      if (params.data.identity_provider) {
        assertIsIdentityProvider(params.data.identity_provider);
        commandParams.identity_provider = params.data.identity_provider;
      }

      if (params.data.first_name) {
        assertIsFirstName(params.data.first_name);
        commandParams.first_name = params.data.first_name;
      }

      if (params.data.last_name) {
        assertIsLastName(params.data.last_name);
        commandParams.last_name = params.data.last_name;
      }

      if (params.data.about) {
        assertIsProfileAbout(params.data.about);
        commandParams.about = params.data.about;
      }

      if (
        params.data.profile_photo &&
        typeof params.data.profile_photo === "object" &&
        params.data.profile_photo !== null &&
        "upload_token" in params.data.profile_photo &&
        typeof params.data.profile_photo.upload_token === "string"
      ) {
        params.data.profile_photo.upload_token;
        commandParams.profile_photo = {
          upload_token: params.data.profile_photo.upload_token,
        };
      }

      if (
        params.data.cover_photo &&
        typeof params.data.cover_photo === "object" &&
        params.data.cover_photo !== null &&
        "upload_token" in params.data.cover_photo &&
        typeof params.data.cover_photo.upload_token === "string"
      ) {
        params.data.cover_photo.upload_token;
        commandParams.cover_photo = {
          upload_token: params.data.cover_photo.upload_token,
        };
      }

      if (
        params.data.password &&
        typeof params.data.password === "object" &&
        params.data.password !== null &&
        "new_password" in params.data.password &&
        typeof params.data.password.new_password === "string"
      ) {
        assertIsRawPassword(params.data.password.new_password);
        if (
          "reset_confirmation_token" in params.data.password &&
          typeof params.data.password.reset_confirmation_token == "string"
        ) {
          commandParams.password = {
            reset_confirmation_token:
              params.data.password.reset_confirmation_token,
            new_password: params.data.password.new_password,
          };
        } else if (
          "current_password" in params.data.password &&
          typeof params.data.password.current_password === "string"
        ) {
          assertIsRawPassword(params.data.password.current_password);
          commandParams.password = {
            current_password: params.data.password.current_password,
            new_password: params.data.password.new_password,
          };
        } else {
          throw new Error("invalid password update params");
        }
      }

      if (params.data.username && typeof params.data.username === "string") {
        assertIsUsername(params.data.username);
        commandParams.username = params.data.username;
      }

      if (
        params.data.email_address &&
        typeof params.data.email_address === "object" &&
        params.data.email_address !== null &&
        "update_confirmation_token" in params.data.email_address &&
        typeof params.data.email_address.update_confirmation_token === "string"
      ) {
        params.data.email_address.update_confirmation_token;
        commandParams.email_address = {
          update_confirmation_token:
            params.data.email_address.update_confirmation_token,
        };
      }

      if (
        params.data.is_email_verified &&
        typeof params.data.is_email_verified === "object" &&
        params.data.is_email_verified !== null &&
        "verification_confirmation_token" in params.data.is_email_verified &&
        typeof params.data.is_email_verified.verification_confirmation_token ===
          "string"
      ) {
        params.data.is_email_verified.verification_confirmation_token;
        commandParams.is_email_verified = {
          verification_confirmation_token:
            params.data.is_email_verified.verification_confirmation_token,
        };
      }

      if (params.data.type && typeof params.data.type === "string") {
        assertIsUserType(params.data.type);
        commandParams.type = params.data.type;
      }
    } catch (error) {
      throw new BadRequestException({
        message: "invalid user update params",
        data: params.data,
      });
    }

    await this.updateUserCommand.execute(
      params.data.user_id,
      params.requester,
      commandParams
    );

    return {};
  }
}
