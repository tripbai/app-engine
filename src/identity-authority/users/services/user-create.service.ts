import { inject, injectable } from "inversify";
import * as IdentityAuthority from "../../module/types";
import { UserModel } from "../user.model";
import { UserPasswordService } from "./user-password.service";
import { UserOTPService } from "./user-otp.service";
import { createEntityId } from "../../../core/utilities/entityToolkit";
import { UserConstraintService } from "./user-constraint.service";
import { getTimestampNow } from "../../../core/utilities/timestamp";

@injectable()
export class UserCreateService {
  constructor(
    @inject(UserPasswordService)
    private userPasswordService: UserPasswordService,
    @inject(UserOTPService) private userOTPService: UserOTPService,
    @inject(UserConstraintService)
    private userConstraintService: UserConstraintService
  ) {}

  async createIAuthUser(
    provider: IdentityAuthority.Providers.Pick<"iauth">,
    creation_context: UserModel["creation_context"],
    role: UserModel["role"],
    type: IdentityAuthority.Users.Type,
    username: IdentityAuthority.Users.Fields.Username,
    email_address: IdentityAuthority.Users.Fields.EmailAddress,
    password: IdentityAuthority.Users.Fields.RawPassword,
    status: IdentityAuthority.Users.Status.Type
  ): Promise<UserModel> {
    const userId = createEntityId();
    const hashedPassword = await this.userPasswordService.hashPassword(
      password
    );

    const uniqueEmail = await this.userConstraintService.isUniqueEmailAddress(
      email_address
    );
    const uniqueUsername = await this.userConstraintService.isUniqueUsername(
      username
    );

    const userModel: Readonly<UserModel> = {
      entity_id: userId,
      identity_provider: "iauth",
      email_address: uniqueEmail,
      username: uniqueUsername,
      is_email_verified: false,
      verified_since: null,
      suspended_until: null,
      creation_context: creation_context,
      role: role,
      password_hash: hashedPassword,
      status: status,
      type: type,
      otp_secret: this.userOTPService.generateOtpSecret(),
      created_at: getTimestampNow(),
      updated_at: getTimestampNow(),
      archived_at: null,
    };

    return userModel;
  }
}
