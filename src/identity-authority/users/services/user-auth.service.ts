import { inject, injectable } from "inversify";
import { UserRepository } from "../user.repository";
import { UserPasswordService } from "./user-password.service";
import { UserModel } from "../user.model";
import * as IdentityAuthority from "../../module/types";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";

@injectable()
export class UserAuthService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(UserPasswordService)
    private userPasswordService: UserPasswordService
  ) {}

  async authenticateIAuthUser(
    userModel: UserModel,
    providedPassword: IdentityAuthority.Users.Fields.RawPassword
  ) {
    this.assertAssignedIdentityProvider(userModel, "iauth");
    if (
      !(await this.userPasswordService.verifyPassword(
        providedPassword,
        userModel.password_hash
      ))
    ) {
      throw new ResourceAccessForbiddenException({
        message: "invalid credentials when generating access token",
        data: { user_id: userModel.entity_id },
      });
    }
  }

  assertAssignedIdentityProvider(
    userModel: UserModel,
    claimedProvider: IdentityAuthority.Providers.Identity
  ) {
    if (userModel.identity_provider !== claimedProvider) {
      throw new ResourceAccessForbiddenException({
        message: "mismatched claimed provider",
        data: {
          assigned_provider: userModel.identity_provider,
          claimed_provider: claimedProvider,
        },
      });
    }
  }
}
