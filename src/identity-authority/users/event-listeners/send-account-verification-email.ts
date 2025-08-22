import { inject, injectable } from "inversify";
import { UserCreateEvent } from "../user.events";
import { ProfileModel } from "../../profiles/profile.model";
import { UserModel } from "../user.model";
import { UserEmailSenderService } from "../services/user-email-sender.service";
import { EventListenerInterface } from "../../../core/providers/event/event-manager.provider";

@injectable()
export class AccountVerificationEmailSender implements EventListenerInterface<UserCreateEvent> {

  constructor(
    @inject(UserEmailSenderService) private readonly userEmailSenderService: UserEmailSenderService
  ){}

  async execute(userModel: UserModel, profileModel: ProfileModel){
    if (userModel.email_address && !userModel.is_email_verified) {
      await this.userEmailSenderService.sendAccountVerificationEmail(userModel, profileModel)
    }
  }

}