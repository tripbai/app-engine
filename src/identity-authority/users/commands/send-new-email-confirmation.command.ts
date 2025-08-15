import { inject, injectable } from "inversify";
import { UserEmailSenderService } from "../services/user-email-sender.service";
import * as Core from "../../../core/module/types";
import * as IdentityAuthority from "../../module/types";
import { UserRepository } from "../user.repository";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { ProfileRepository } from "../../profiles/profile.repository";

/**
 * Command to send a new email confirmation request to a user.
 */
@injectable()
export class SendNewEmailConfirmationCommand {
  constructor(
    @inject(UserEmailSenderService)
    private readonly userEmailSenderService: UserEmailSenderService,
    @inject(UserRepository) private readonly userRepository: UserRepository,
    @inject(IAuthRequesterFactory)
    private readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository
  ) {}

  async execute(
    requester: Core.Authorization.Requester,
    newEmailAddress: IdentityAuthority.Users.Fields.EmailAddress
  ) {
    const iAuthRequester = this.iAuthRequesterFactory.create(requester);
    if (!iAuthRequester.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: "Only regular users can send new email confirmation requests.",
        data: { requester },
      });
    }
    const userId = iAuthRequester.get().user.entity_id;
    const userModel = await this.userRepository.getById(userId);
    const profileModel = await this.profileRepository.getById(userId);
    await this.userEmailSenderService.sendConfirmationEmail(
      userModel,
      profileModel,
      newEmailAddress
    );
    return;
  }
}
