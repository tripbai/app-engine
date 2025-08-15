import { inject, injectable } from "inversify";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { ResendAccountVerificationEmailCommand } from "../commands/resend-account-verification-email.command";
import { UserAssertions } from "../user.assertions";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { SendPasswordResetCommand } from "../commands/send-password-reset-email.command";
import { SendNewEmailConfirmationCommand } from "../commands/send-new-email-confirmation.command";

@injectable()
export class UserSendEmailController {
  constructor(
    @inject(UserAssertions) private readonly userAssertions: UserAssertions,
    @inject(ResendAccountVerificationEmailCommand)
    private readonly resendAccountVerificationEmailCommand: ResendAccountVerificationEmailCommand,
    @inject(SendPasswordResetCommand)
    private readonly sendPasswordResetCommand: SendPasswordResetCommand,
    @inject(SendNewEmailConfirmationCommand)
    private readonly sendNewEmailConfirmationCommand: SendNewEmailConfirmationCommand
  ) {}

  @post<IdentityAuthority.Users.Endpoints.SendEmailForAccountVerification>(
    "/identity-authority/user/send-account-verification-email"
  )
  async resendAccountVerificationEmail<
    T extends IdentityAuthority.Users.Endpoints.SendEmailForAccountVerification
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    await this.resendAccountVerificationEmailCommand.execute(params.requester);
    return {};
  }

  @post<IdentityAuthority.Users.Endpoints.SendEmailForPasswordReset>(
    "/identity-authority/user/send-password-reset-email"
  )
  async sendPasswordResetEmail<
    T extends IdentityAuthority.Users.Endpoints.SendEmailForPasswordReset
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      this.userAssertions.isEmailAddress(params.data.email_address);
    } catch (error) {
      throw new BadRequestException({
        message: "Invalid email address provided for password reset.",
        data: { error },
      });
    }
    await this.sendPasswordResetCommand.execute(params.data.email_address);
    return {};
  }

  @post<IdentityAuthority.Users.Endpoints.SendEmailForNewEmailConfirmation>(
    "/identity-authority/user/send-new-email-confirmation"
  )
  async sendEmailForNewEmailConfirmation<
    T extends IdentityAuthority.Users.Endpoints.SendEmailForNewEmailConfirmation
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      this.userAssertions.isEmailAddress(params.data.email_address);
    } catch (error) {
      throw new BadRequestException({
        message: "Invalid email address provided for new email confirmation.",
        data: { error },
      });
    }
    // Logic to send email for new email confirmation would go here.
    await this.sendNewEmailConfirmationCommand.execute(
      params.requester,
      params.data.email_address
    );
    return {};
  }
}
