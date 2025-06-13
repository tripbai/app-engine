import { inject, injectable } from "inversify";
import { IdentityAuthority } from "../../module/module.interface";
import { UserAssertions } from "../user.assertions";
import { Core } from "../../../core/module/module";
import { UserRepository } from "../user.repository";
import { LogicException, RecordAlreadyExistsException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import { UserModel } from "../user.model";
import { UserPasswordService } from "./user-password.service";
import { TimeStamp } from "../../../core/helpers/timestamp";
import { UserActionTokenService } from "./user-action-token.service";
import { IAuthRequester } from "../../requester/iauth-requester";

@injectable()
export class UserUpdateService {

  constructor(
    @inject(UserAssertions) public readonly userAssertions: UserAssertions,
    @inject(UserPasswordService) public readonly userPasswordService: UserPasswordService,
    @inject(UserActionTokenService) public readonly userActionTokenService: UserActionTokenService,
    @inject(UserRepository) public readonly userRepository: UserRepository
  ){}

  async updateUsername(
    userModel: UserModel,
    username: IdentityAuthority.Users.Fields.Username
  ): Promise<void> {
    if (userModel.status !== 'active' && userModel.status !== 'unverified') {
      throw new ResourceAccessForbiddenException({
        message: 'cannot update user when user is not active or unverified',
        data: { user_id: userModel.entity_id, status: userModel.status }
      })
    }
    const uniqueUsername = await this.userAssertions.isUniqueUsername(username)
    userModel.username = uniqueUsername  
  }

  async updatePasswordUsingResetToken(
    userModel: UserModel,
    resetToken: string,
    password: IdentityAuthority.Users.Fields.RawPassword
  ){
    if (userModel.status === 'archived' || userModel.status === 'banned' || userModel.status === 'suspended') {
      throw new ResourceAccessForbiddenException({
        message: 'unable to reset password due to user status',
        data: { user_id: userModel.entity_id, status: userModel.status }
      })
    }
    const tokenPayload = this.userActionTokenService.parse(userModel.entity_id, resetToken)
    if (tokenPayload.user_id !== userModel.entity_id) {
      throw new ResourceAccessForbiddenException({
        message: 'user id mismatch in token payload',
        data: { token_payload: tokenPayload, user_id: userModel.entity_id }
      })
    }
    if (tokenPayload.action !== 'password:reset_confirmation') {
      throw new ResourceAccessForbiddenException({
        message: 'action type mismatch in token payload',
        data: { token_payload: tokenPayload, action_type: 'password:reset_confirmation' }
      })
    }
    const hashedPassword = await this.userPasswordService.hashPassword(password)
    userModel.password_hash = hashedPassword
  }

  async updatePasswordUsingCurrentPassword(
    userModel: UserModel,
    currentPassword: IdentityAuthority.Users.Fields.RawPassword,
    newPassword: IdentityAuthority.Users.Fields.RawPassword
  ){
    if (userModel.status === 'archived' || userModel.status === 'banned' || userModel.status === 'suspended') {
      throw new ResourceAccessForbiddenException({
        message: 'unable to update password due to user status',
        data: { user_id: userModel.entity_id, status: userModel.status }
      })
    }
    const isVerifiedPassword = await this.userPasswordService.verifyPassword(
      currentPassword, userModel.password_hash
    )
    if (!isVerifiedPassword) {
      throw new ResourceAccessForbiddenException({
        message: 'unable to update password due to password mismatch',
        data: {user_id: userModel.entity_id}
      })
    }
    const hashedPassword 
      = await this.userPasswordService.hashPassword(
        newPassword
      )
    userModel.password_hash = hashedPassword
  }

  async updateEmailUsingConfirmationToken(
    userModel: UserModel,
    confirmationToken: string
  ){
    if (userModel.status === 'archived' || userModel.status === 'banned' || userModel.status === 'suspended') {
      throw new ResourceAccessForbiddenException({
        message: 'unable to update email address due to user status',
        data: { user_id: userModel.entity_id, status: userModel.status }
      })
    }
    const tokenPayload = this.userActionTokenService.parse(userModel.entity_id, confirmationToken)
    if (tokenPayload.user_id !== userModel.entity_id) {
      throw new ResourceAccessForbiddenException({
        message: 'user id mismatch in token payload',
        data: { token_payload: tokenPayload, user_id: userModel.entity_id }
      })
    }
    if (tokenPayload.action !== 'email_address:confirmation_token') {
      throw new ResourceAccessForbiddenException({
        message: 'action type mismatch in token payload',
        data: { token_payload: tokenPayload, action_type: 'email_address:confirmation_token' }
      })
    }
    const newEmailAddress = tokenPayload.new_email_address
    const uniqueEmailAddress = await this.userAssertions.isUniqueEmailAddress(newEmailAddress)
    userModel.email_address = uniqueEmailAddress
    this.setUserAsVerified(userModel)
  }

  async setUserAsVerifiedUsingVerificationToken(
    userModel: UserModel,
    verificationToken: string
  ){
    const tokenPayload = this.userActionTokenService.parse(
      userModel.entity_id, 
      verificationToken
    )
    if (tokenPayload.user_id !== userModel.entity_id) {
      throw new ResourceAccessForbiddenException({
        message: 'user id mismatch in token payload',
        data: { token_payload: tokenPayload, user_id: userModel.entity_id }
      })
    }
    if (tokenPayload.action !== 'account:verification_token') {
      throw new ResourceAccessForbiddenException({
        message: 'action type mismatch in token payload',
        data: { token_payload: tokenPayload, action_type: 'account:verification_token' }
      })
    }
    this.setUserAsVerified(userModel)
  }

  private async setUserAsVerified(
    userModel: UserModel
  ){
    userModel.is_email_verified = true
    userModel.verified_since = TimeStamp.now()
    userModel.status = 'active'
  }

  async setRoleAsUser(
    iAuthRequester: IAuthRequester,
    userModel: UserModel
  ){

    if (userModel.status !== 'active' && userModel.status !== 'unverified') {
      throw new ResourceAccessForbiddenException({
        message: 'unable to update user role due to user status',
        data: { user_id: userModel.entity_id, status: userModel.status }
      })
    }

    if (iAuthRequester.isWebAdmin()) {
      if (iAuthRequester.get().user.entity_id === userModel.entity_id) {
        throw new ResourceAccessForbiddenException({
          message: 'web admin cannot demote himself to regular user',
          data: { requester: iAuthRequester.get() }
        })
      }
      if (!iAuthRequester.canOperateThisUser(userModel.entity_id)) {
        throw new LogicException({
          message: 'must be an anomaly as requester with web admin permission can operate anyone',
          data: { requester: iAuthRequester.get() }
        })
      }
      if (userModel.role === 'user') {
        throw new RecordAlreadyExistsException({
          message: 'user already has user role',
          data: { user_id: userModel.entity_id }
        })
      }
      userModel.role = 'user'
      return
    }

    if (iAuthRequester.hasCoreAppAccess()){
      if (userModel.role !== 'webadmin') {
        throw new RecordAlreadyExistsException({
          message: 'core access can only demote webadmins to user',
          data: { user_id: userModel.entity_id }
        })
      }
      userModel.role = 'user'
    }

  }

  async setRoleAsModerator(
    iAuthRequester: IAuthRequester,
    userModel: UserModel
  ){

    if (userModel.status !== 'active' && userModel.status !== 'unverified') {
      throw new ResourceAccessForbiddenException({
        message: 'unable to update user role due to user status',
        data: { user_id: userModel.entity_id, status: userModel.status }
      })
    }
    
    if (iAuthRequester.isWebAdmin()) {
      if (iAuthRequester.get().user.entity_id === userModel.entity_id) {
        throw new ResourceAccessForbiddenException({
          message: 'web admin cannot demote himself as moderator',
          data: { requester: iAuthRequester.get() }
        })
      }
      if (!iAuthRequester.canOperateThisUser(userModel.entity_id)) {
        throw new LogicException({
          message: 'must be an anomaly as requester with web admin permission can operate anyone',
          data: { requester: iAuthRequester.get() }
        })
      }
      if (userModel.role === 'moderator') {
        throw new RecordAlreadyExistsException({
          message: 'user already has moderator role',
          data: { user_id: userModel.entity_id }
        })
      }
      userModel.role = 'moderator'
      return
    }

  }

  async setRoleAsWebadmin(
    iAuthRequester: IAuthRequester,
    userModel: UserModel
  ){

    if (userModel.status !== 'active' && userModel.status !== 'unverified') {
      throw new ResourceAccessForbiddenException({
        message: 'unable to update user role due to user status',
        data: { user_id: userModel.entity_id, status: userModel.status }
      })
    }
    
    if (iAuthRequester.hasCoreAppAccess()){
      if (userModel.role === 'webadmin') {
        throw new RecordAlreadyExistsException({
          message: 'user is already web admin',
          data: { user_id: userModel.entity_id }
        })
      }
      userModel.role = 'webadmin'
    }

  }



}