import { inject, injectable } from "inversify";
import * as IdentityAuthority from "../../module/types";
import { UserModel } from "../user.model";
import { UserPasswordService } from "./user-password.service";
import { UserOTPService } from "./user-otp.service";
import { createEntityId } from "../../../core/utilities/entityToolkit";
import { UserConstraintService } from "./user-constraint.service";
import { getTimestampNow } from "../../../core/utilities/timestamp";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import { UserRepository } from "../user.repository";
import { BadInputException } from "../../../core/exceptions/exceptions";
import { assertIsRawPassword } from "../user.assertions";

@injectable()
export class UserCreateService {
  constructor(
    @inject(UserPasswordService)
    private userPasswordService: UserPasswordService,
    @inject(UserOTPService) private userOTPService: UserOTPService,
    @inject(UserConstraintService)
    private userConstraintService: UserConstraintService,
    @inject(UserRepository) private userRepository: UserRepository
  ) {}

  async createUser(
    provider: IdentityAuthority.Providers.Identity,
    username: IdentityAuthority.Users.Fields.Username,
    email_address: IdentityAuthority.Users.Fields.EmailAddress,
    password: IdentityAuthority.Users.Fields.RawPassword | null,
    type: IdentityAuthority.Users.Type,
    creation_context: UserModel["creation_context"],
    role: UserModel["role"],
    status: IdentityAuthority.Users.Status.Type,
    unitOfWork: UnitOfWork
  ): Promise<Readonly<UserModel>> {
    const uniqueEmail = await this.userConstraintService.isUniqueEmailAddress(
      email_address
    );
    const uniqueUsername = await this.userConstraintService.isUniqueUsername(
      username
    );
    let hashedPassword: IdentityAuthority.Users.Fields.HashedPassword | null =
      null;
    let identityProvider: IdentityAuthority.Providers.Identity = "iauth";
    if (
      type === "concrete" &&
      creation_context === "external" &&
      provider === "iauth" &&
      role === "user" &&
      status === "unverified"
    ) {
      // Create the user
      assertIsRawPassword(password);
      hashedPassword = await this.userPasswordService.hashPassword(password);
      identityProvider = provider;
    } else {
      throw new BadInputException({
        message: "unsupported create user workflow",
        data: { provider, creation_context, role, status, type },
      });
    }
    const userModel = this.userRepository.create(
      {
        username: uniqueUsername,
        email_address: uniqueEmail,
        identity_provider: identityProvider,
        is_email_verified: false,
        creation_context: creation_context,
        password_hash: hashedPassword,
        type: type,
        role: role,
        status: status,
        verified_since: null,
        suspended_until: null,
        otp_secret: this.userOTPService.generateOtpSecret(),
      },
      unitOfWork
    );
    return userModel;
  }
}
