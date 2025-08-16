import { inject, injectable } from "inversify";
import { UserCreateService } from "../services/user-create.service";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import {
  assertIsFirstName,
  assertIsLastName,
} from "../../profiles/profile.assertions";
import { CreateUserCommand } from "../commands/create-user.command";
import {
  assertIsCreationContext,
  assertIsEmailAddress,
  assertIsIdentityProvider,
  assertIsRawPassword,
  assertIsRole,
  assertIsStatus,
  assertIsUsername,
  assertIsUserType,
} from "../user.assertions";

@injectable()
export class UserCreateController {
  constructor(
    @inject(UserCreateService)
    private userCreateService: UserCreateService,
    @inject(CreateUserCommand)
    private createUserCommand: CreateUserCommand
  ) {}

  @post<IdentityAuthority.Users.Endpoints.Create>("/identity-authority/users")
  async create<T extends IdentityAuthority.Users.Endpoints.Create>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    let password: IdentityAuthority.Users.Fields.RawPassword | null = null;
    try {
      assertIsFirstName(params.data.first_name);
      assertIsLastName(params.data.last_name);
      assertIsUsername(params.data.username);
      assertIsEmailAddress(params.data.email_address);
      assertIsUserType(params.data.type);
      assertIsCreationContext(params.data.context);
      assertIsRole(params.data.role);
      assertIsIdentityProvider(params.data.provider);
      assertIsStatus(params.data.status);
      if ("password" in params.data) {
        assertIsRawPassword(params.data.password);
        password = params.data.password;
      }
    } catch (error) {
      throw new BadRequestException({
        message: "create user params validation failed",
        data: params.data,
      });
    }

    const response = await this.createUserCommand.execute({
      provider: params.data.provider,
      first_name: params.data.first_name,
      last_name: params.data.last_name,
      username: params.data.username,
      email_address: params.data.email_address,
      password: password,
      type: params.data.type,
      creation_context: params.data.context,
      role: params.data.role,
      status: params.data.status,
    });

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
      iauth_token: response.iauth_token,
    };
  }
}
