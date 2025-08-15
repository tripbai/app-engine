import { inject, injectable } from "inversify";
import { UserModel } from "../user.model";
import { ProfileModel } from "../../profiles/profile.model";
import { EmailTemplateRepository } from "../../email-templates/email-template.repository";
import { UserActionTokenService } from "./user-action-token.service";
import { AbstractMailProvider } from "../../../core/providers/mail/mail.provider";
import {
  DataIntegrityException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import * as IdentityAuthority from "../../module/types";
import { UserUpdateService } from "./user-update.service";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import { getEnv } from "../../../core/application/appEnv";
import { UserConstraintService } from "./user-constraint.service";

@injectable()
export class UserEmailSenderService {
  constructor(
    @inject(EmailTemplateRepository)
    private emailTemplateRepository: EmailTemplateRepository,
    @inject(AbstractMailProvider)
    private abstractMailProvider: AbstractMailProvider,
    @inject(UserActionTokenService)
    private userActionTokenService: UserActionTokenService,
    @inject(UserUpdateService)
    private userUpdateService: UserUpdateService,
    @inject(UserConstraintService)
    private userConstraintService: UserConstraintService
  ) {}

  /**
   * Sends an account verification email to the user.
   * @param userModel
   * @param profileModel
   */
  async sendAccountVerificationEmail(
    userModel: UserModel,
    profileModel: ProfileModel
  ) {
    if (userModel.status !== "unverified") {
      // If the user is not in an unverified state, we do not send a verification email
      return;
    }
    const templateInstance =
      await this.emailTemplateRepository.getTemplateByType(
        "account_verification_template"
      );
    if (templateInstance === null) {
      throw new DataIntegrityException({
        message: "missing template instance for account_verification_template",
        data: {},
      });
    }
    const templateId = templateInstance.template_id;
    const actionToken = this.userActionTokenService.generate({
      action: "account:verification_token",
      user_id: userModel.entity_id,
    });
    const mailerSenderId = getEnv("IAUTH_MAILMAN_SENDER_ID");
    assertValidEntityId(mailerSenderId);
    await this.abstractMailProvider.sendEmail({
      sender_id: mailerSenderId,
      template_id: templateId,
      to_email: userModel.email_address,
      variables: this.createVariables(userModel, profileModel, actionToken),
    });
  }

  /**
   * Sends a password reset email to the user.
   * @param userModel
   * @param profileModel
   */
  async sendPasswordResetEmail(
    userModel: UserModel,
    profileModel: ProfileModel
  ) {
    // Checks whether the user is in a status that allows password updates
    if (!this.userUpdateService.isStatusAllowedForPasswordUpdate(userModel)) {
      throw new ResourceAccessForbiddenException({
        message: "User status is not allowed to send password reset email",
        data: { userModel },
      });
    }
    const templateInstance =
      await this.emailTemplateRepository.getTemplateByType(
        "password_reset_template"
      );
    if (templateInstance === null) {
      throw new DataIntegrityException({
        message: "missing template instance for password_reset_template",
        data: {},
      });
    }
    const templateId = templateInstance.template_id;
    const actionToken = this.userActionTokenService.generate({
      action: "password:reset_confirmation",
      user_id: userModel.entity_id,
    });
    const mailerSenderId = getEnv("IAUTH_MAILMAN_SENDER_ID");
    assertValidEntityId(mailerSenderId);
    // Sends the email using the abstract mail provider
    await this.abstractMailProvider.sendEmail({
      sender_id: mailerSenderId,
      template_id: templateId,
      to_email: userModel.email_address,
      variables: this.createVariables(userModel, profileModel, actionToken),
    });
  }

  /**
   * Sends a confirmation email to the user for changing their email address.
   * @param userModel - the user model
   * @param profileModel - the profile model
   * @param newEmailAddress - the new email address to confirm
   */
  async sendConfirmationEmail(
    userModel: UserModel,
    profileModel: ProfileModel,
    newEmailAddress: IdentityAuthority.Users.Fields.EmailAddress
  ) {
    // Checks whether the user is in a status that allows email updates
    if (!this.userUpdateService.isStatusAllowedForEmailUpdate(userModel)) {
      throw new ResourceAccessForbiddenException({
        message:
          "User status is not allowed to send email confirmation for update",
        data: { userModel },
      });
    }
    /** Checks whether the email address has not been taken */
    await this.userConstraintService.isUniqueEmailAddress(newEmailAddress);
    const templateInstance =
      await this.emailTemplateRepository.getTemplateByType(
        "email_confirmation_template"
      );
    if (templateInstance === null) {
      throw new DataIntegrityException({
        message: "missing template instance for email_confirmation_template",
        data: {},
      });
    }
    const templateId = templateInstance.template_id;
    const actionToken = this.userActionTokenService.generate({
      action: "email_address:confirmation_token",
      user_id: userModel.entity_id,
      new_email_address: newEmailAddress,
    });
    const mailerSenderId = getEnv("IAUTH_MAILMAN_SENDER_ID");
    assertValidEntityId(mailerSenderId);
    await this.abstractMailProvider.sendEmail({
      sender_id: mailerSenderId,
      template_id: templateId,
      to_email: userModel.email_address,
      variables: this.createVariables(userModel, profileModel, actionToken),
    });
  }

  createVariables(
    userModel: UserModel,
    profileModel: ProfileModel,
    actionToken: string
  ) {
    return {
      entity_id: userModel.entity_id,
      first_name: profileModel.first_name,
      last_name: profileModel.last_name,
      email_address: userModel.email_address,
      username: userModel.username,
      action_token: actionToken,
    };
  }
}
