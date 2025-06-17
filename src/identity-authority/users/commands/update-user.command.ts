import { inject, injectable } from "inversify";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { UserRepository } from "../user.repository";
import { BadRequestException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { ProfileRepository } from "../../profiles/profile.repository";
import { IAuthRequester } from "../../requester/iauth-requester";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { ProfileUpdateService } from "../../profiles/services/profile-update.service";
import { IAuthImageTokenService } from "../../services/image-token.service";
import { UserActionTokenService } from "../services/user-action-token.service";
import { UserUpdateService } from "../services/user-update.service";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UserUpdateEvent } from "../user.events";

@injectable()
export class UpdateUserCommand {

  constructor(
    @inject(UserRepository) public readonly userRepository: UserRepository,
    @inject(ProfileRepository) public readonly profileRepository: ProfileRepository,
    @inject(IAuthRequesterFactory) public readonly iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(ProfileUpdateService) public readonly profileUpdateService: ProfileUpdateService,
    @inject(UserUpdateService) public readonly userUpdateService: UserUpdateService,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(AbstractEventManagerProvider) public readonly abstractEventManagerProvider: AbstractEventManagerProvider
  ){}

  async execute(
    userId: Core.Entity.Id,
    requester: Core.Authorization.Requester,
    params: {
      identity_provider?: IdentityAuthority.Providers.Identity
      first_name?: IdentityAuthority.Profile.Fields.FirstName
      last_name?: IdentityAuthority.Profile.Fields.LastName
      about?: string
      profile_photo?: {
        upload_token: string
      }
      cover_photo?: {
        upload_token: string
      }
      password?: {
        reset_confirmation_token?: string
        current_password?: IdentityAuthority.Users.Fields.RawPassword
        new_password: IdentityAuthority.Users.Fields.RawPassword
      }
      username?: IdentityAuthority.Users.Fields.Username 
      email_address?: {
        update_confirmation_token: string
      }
      is_email_verified?: {
        verification_confirmation_token: string
      }
      type?: IdentityAuthority.Users.Type
    }
  ): Promise<void> {

    /**
     * Updates the password using just reset confirmation token
     */
    if (params.password && params.password.reset_confirmation_token) {
      const unitOfWork = this.unitOfWorkFactory.create()
      const userModel = await this.userRepository.getById(userId)
      await this.userUpdateService.updatePasswordUsingResetToken(
        userModel, 
        params.password.reset_confirmation_token,
        params.password.new_password
      )
      unitOfWork.addTransactionStep(
        await this.userRepository.update(userModel)
      )
      await unitOfWork.commit()
      return
    }

    /**
     * Updates the email address and verifies the user as side-effect
     */
    if (params.email_address && params.email_address.update_confirmation_token) {
      const unitOfWork = this.unitOfWorkFactory.create()
      const userModel = await this.userRepository.getById(userId)
      await this.userUpdateService.updateEmailUsingConfirmationToken(
        userModel,
        params.email_address.update_confirmation_token
      )
      unitOfWork.addTransactionStep(
        await this.userRepository.update(userModel)
      )
      await unitOfWork.commit()
      return
    }

    /**
     * Verifies the user
     */
    if (params.is_email_verified && params.is_email_verified.verification_confirmation_token) {
      const unitOfWork = this.unitOfWorkFactory.create()
      const userModel = await this.userRepository.getById(userId)
      await this.userUpdateService.setUserAsVerifiedUsingVerificationToken(
        userModel,
        params.is_email_verified.verification_confirmation_token
      )
      unitOfWork.addTransactionStep(
        await this.userRepository.update(userModel)
      )
      await unitOfWork.commit()
      return 
    }

    /** Regular user updates */
    const unitOfWork = this.unitOfWorkFactory.create()

    const userModel    = await this.userRepository.getById(userId)
    const profileModel = await this.profileRepository.getById(userId)

    const iAuthRequester = this.iAuthRequesterFactory.create(requester)
    if (!iAuthRequester.canOperateThisUser(userModel.entity_id)) {
      throw new ResourceAccessForbiddenException({
        message: 'insufficient permission to operate this user',
        data: { user_id: userId, requester: requester }
      })
    }

    if (params.identity_provider) {
      if (params.identity_provider !== userModel.identity_provider) {
        throw new ResourceAccessForbiddenException({
          message: 'identity provider cannot be updated at this time',
          data: { user_id: userId, identity_provider: params.identity_provider }
        })
      }
    }

    if (params.first_name) {
      this.profileUpdateService.updateFirstName(profileModel, params.first_name)
    }

    if (params.last_name) {
      this.profileUpdateService.updateLastName(profileModel, params.last_name)
    }
    
    if (params.about) {
      this.profileUpdateService.updateAbout(profileModel, params.about)
    }

    if(params.profile_photo && params.profile_photo.upload_token) {
      this.profileUpdateService.updateProfilePhotoUsingImageToken(
        userModel, profileModel, params.profile_photo.upload_token
      )
    }

    if (params.cover_photo && params.cover_photo.upload_token) {
      this.profileUpdateService.updateCoverPhotoUsingImageToken(
        userModel, profileModel, params.cover_photo.upload_token
      )
    }

    if (params.password && params.password.current_password) {
      await this.userUpdateService.updatePasswordUsingCurrentPassword(
        userModel, params.password.current_password, params.password.new_password
      )
    }

    if (params.username) {
      await this.userUpdateService.updateUsername(
        userModel, params.username
      )
    }

    unitOfWork.addTransactionStep(
      await this.userRepository.update(userModel)
    )
    unitOfWork.addTransactionStep(
      await this.profileRepository.update(profileModel)
    )

    await unitOfWork.commit()
    await this.abstractEventManagerProvider.dispatch(
      new UserUpdateEvent, userModel, profileModel
    )
    return 

  }

}