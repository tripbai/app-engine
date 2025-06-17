import { inject, injectable } from "inversify";
import { ProfileRepository } from "../../profiles/profile.repository";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { UserEmailSenderService } from "../services/user-email-sender.service";
import { UserRepository } from "../user.repository";
import { Core } from "../../../core/module/module";
import { IdentityAuthority } from "../../module/module.interface";
import { BadRequestException } from "../../../core/exceptions/exceptions";

/**
 * Command to send a new email confirmation request to a user.
 */
@injectable()
export class SendPasswordResetCommand {

  constructor(
    @inject(UserEmailSenderService) private readonly userEmailSenderService: UserEmailSenderService,
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(IAuthRequesterFactory) private readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(ProfileRepository) private readonly profileRepository: ProfileRepository
  ) {}

  async execute(
    userEmail: IdentityAuthority.Users.Fields.EmailAddress
  ){
    const userModel = await this.userRepository.getByEmailAddress(userEmail)
    if (userModel === null) {
      throw new BadRequestException({
        message: 'User with this email does not exist.',
        data: { user_email: userEmail }
      })
    }
    const profileModel = await this.profileRepository.getById(userModel.entity_id)
    await this.userEmailSenderService.sendPasswordResetEmail(
      userModel, profileModel
    )
    return
  }

}