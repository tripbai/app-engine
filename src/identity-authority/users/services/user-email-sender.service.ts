import { inject, injectable } from "inversify"
import { UserModel } from "../user.model"
import { ProfileModel } from "../../profiles/profile.model"
import { EmailTemplateRepository } from "../../email-templates/email-template.repository"
import { UserActionTokenService } from "./user-action-token.service"
import { AbstractMailProvider } from "../../../core/providers/mail/mail.provider"
import { DataIntegrityException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions"
import { AppENV } from "../../../core/helpers/env"
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit"
import { IdentityAuthority } from "../../module/module.interface"
import { UserAssertions } from "../user.assertions"
import { UserUpdateService } from "./user-update.service"

@injectable()
export class UserEmailSenderService {

  constructor(
    @inject(EmailTemplateRepository) public readonly emailTemplateRepository: EmailTemplateRepository,
    @inject(AbstractMailProvider) public readonly abstractMailProvider: AbstractMailProvider,
    @inject(UserActionTokenService) public readonly userActionTokenService: UserActionTokenService,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions,
    @inject(UserUpdateService) public readonly userUpdateService: UserUpdateService
  ){}

  /**
   * Sends an account verification email to the user.
   * @param userModel 
   * @param profileModel 
   */
  async sendAccountVerificationEmail(
    userModel: UserModel,
    profileModel: ProfileModel
  ) {
    if (userModel.status !== 'unverified') {
      // If the user is not in an unverified state, we do not send a verification email
      return
    }
    const templateInstance = await this.emailTemplateRepository.getTemplateByType('account_verification_template')
    if (templateInstance === null) {
      throw new DataIntegrityException({
        message: 'missing template instance for account_verification_template',
        data: {}
      })
    }
    const templateId = templateInstance.template_id
    const actionToken = this.userActionTokenService.generate({
      action: 'account:verification_token',
      user_id: userModel.entity_id
    })
    const mailerSenderId = AppENV.get('IAUTH_MAILMAN_SENDER_ID')
    EntityToolkit.Assert.idIsValid(mailerSenderId)
    await this.abstractMailProvider.sendEmail({
      sender_id: mailerSenderId,
      template_id: templateId,
      to_email: userModel.email_address,
      variables: this.createVariables(userModel, profileModel, actionToken)
    })
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
        message: 'User status is not allowed to send password reset email',
        data: { userModel }
      })
    }
    const templateInstance = await this.emailTemplateRepository.getTemplateByType('password_reset_template')
    if (templateInstance === null) {
      throw new DataIntegrityException({
        message: 'missing template instance for password_reset_template',
        data: {}
      })
    }
    const templateId = templateInstance.template_id
    const actionToken = this.userActionTokenService.generate({
      action: 'password:reset_confirmation',
      user_id: userModel.entity_id
    })
    const mailerSenderId = AppENV.get('IAUTH_MAILMAN_SENDER_ID')
    EntityToolkit.Assert.idIsValid(mailerSenderId)
    // Sends the email using the abstract mail provider
    await this.abstractMailProvider.sendEmail({
      sender_id: mailerSenderId,
      template_id: templateId,
      to_email: userModel.email_address,
      variables: this.createVariables(userModel, profileModel, actionToken)
    })
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
        message: 'User status is not allowed to send email confirmation for update',
        data: { userModel }
      })
    }
    /** Checks whether the email address has not been taken */
    await this.userAssertions.isUniqueEmailAddress(newEmailAddress)
    const templateInstance = await this.emailTemplateRepository.getTemplateByType('email_confirmation_template')
    if (templateInstance === null) {
      throw new DataIntegrityException({
        message: 'missing template instance for email_confirmation_template',
        data: {}
      })
    }
    const templateId = templateInstance.template_id
    const actionToken = this.userActionTokenService.generate({
      action: 'email_address:confirmation_token',
      user_id: userModel.entity_id,
      new_email_address: newEmailAddress
    })
    const mailerSenderId = AppENV.get('IAUTH_MAILMAN_SENDER_ID')
    EntityToolkit.Assert.idIsValid(mailerSenderId)
    await this.abstractMailProvider.sendEmail({
      sender_id: mailerSenderId,
      template_id: templateId,
      to_email: userModel.email_address,
      variables: this.createVariables(userModel, profileModel, actionToken)
    })
  }

  createVariables(
    userModel: UserModel, 
    profileModel: ProfileModel,
    actionToken: string
  ){
    return {
      entity_id: userModel.entity_id,
      first_name: profileModel.first_name,
      last_name: profileModel.last_name,
      email_address: userModel.email_address,
      username: userModel.username,
      action_token: actionToken
    }
  }

}