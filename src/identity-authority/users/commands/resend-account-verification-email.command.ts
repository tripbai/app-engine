import { inject, injectable } from "inversify";
import { ProfileRepository } from "../../profiles/profile.repository";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { UserEmailSenderService } from "../services/user-email-sender.service";
import { UserRepository } from "../user.repository";
import { Core } from "../../../core/module/module";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";

/**
 * Command to resend the account verification email to a user.
 */
@injectable()
export class ResendAccountVerificationEmailCommand {

  constructor(
    @inject(UserEmailSenderService) private readonly userEmailSenderService: UserEmailSenderService,
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(IAuthRequesterFactory) private readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(ProfileRepository) private readonly profileRepository: ProfileRepository
  ) {}

  async execute(
    requester: Core.Authorization.Requester
  ){

    const iAuthRequester = this.iAuthRequesterFactory.create(requester);
    if (!iAuthRequester.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: 'Only regular users can resend account verification emails.',
        data: { requester }
      });
    }
    const userId = iAuthRequester.get().user.entity_id;
    const userModel = await this.userRepository.getById(userId);
    const profileModel = await this.profileRepository.getById(userId);
    await this.userEmailSenderService.sendAccountVerificationEmail(
      userModel, profileModel
    )
    return
  }

}