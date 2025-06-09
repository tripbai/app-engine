import { inject, injectable } from "inversify";
import { IdentityAuthority } from "../../module/module.interface";
import { UserModel } from "../user.model";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { UserPasswordService } from "./user-password.service";
import { TimeStamp } from "../../../core/helpers/timestamp";
import { UserOTPService } from "./user-otp.service";
import { UserAssertions } from "../user.assertions";
import { BadRequestException } from "../../../core/exceptions/exceptions";

@injectable()
export class UserCreateService {

  constructor(
    @inject(UserPasswordService) public readonly userPasswordService: UserPasswordService,
    @inject(UserOTPService) public readonly userOTPService: UserOTPService,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions
  ){}

  async createIAuthUser (
    provider: IdentityAuthority.Providers.Pick<'iauth'>,
    creation_context: UserModel['creation_context'],
    role: UserModel['role'],
    type: IdentityAuthority.Users.Type,
    username: IdentityAuthority.Users.Fields.Username,
    email_address: IdentityAuthority.Users.Fields.EmailAddress,
    password: IdentityAuthority.Users.Fields.RawPassword,
    status: IdentityAuthority.Users.Status.Type
  ): Promise<UserModel> {

    const userId = Pseudorandom.alphanum32()
    const hashedPassword = await this.userPasswordService.hashPassword(password)

    const uniqueEmail = 
      await this.userAssertions.isUniqueEmailAddress(email_address)
    const uniqueUsername =
      await this.userAssertions.isUniqueUsername(username)

    const userModel: Readonly<UserModel> = {
      entity_id: userId,
      identity_provider: 'iauth',
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
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null
    }

    return userModel
  }


}