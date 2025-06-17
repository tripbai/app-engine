import { inject, injectable } from "inversify";
import { ProfileModel } from "../profile.model";
import { IdentityAuthority } from "../../module/module.interface";
import { ProfileValidator } from "../profile.validator";
import { Core } from "../../../core/module/module";
import { IAuthImageTokenService } from "../../services/image-token.service";
import { UserModel } from "../../users/user.model";
import { BadRequestException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";

@injectable()
export class ProfileUpdateService {

  constructor(
    @inject(IAuthImageTokenService) public readonly iAuthImageTokenService: IAuthImageTokenService
  ){}

  updateFirstName(
    profileModel: ProfileModel, 
    newFirstName: IdentityAuthority.Profile.Fields.FirstName
  ){
    profileModel.first_name = newFirstName
  }

  updateLastName(
    profileModel: ProfileModel, 
    newLastName: IdentityAuthority.Profile.Fields.LastName
  ){
    profileModel.last_name = newLastName
  }

  updateAbout(
    profileModel: ProfileModel, 
    newAbout: string
  ){
    ProfileValidator.about(newAbout)
    profileModel.about = newAbout
  }

  updateProfilePhotoUsingImageToken(
    userModel: UserModel,
    profileModel: ProfileModel,
    imageToken: string
  ){
    const tokenPayload = this.iAuthImageTokenService.parse(
      userModel.entity_id,
      imageToken
    )
    if (tokenPayload.type !== 'profile_photo') {
      throw new BadRequestException({
        message: 'image token type must be profile photo',
        data: { token_payload: tokenPayload }
      })
    }
    /**
     * Ensures that the image token is for the user
     */
    if (tokenPayload.upload_for_entity_id !== userModel.entity_id) {
      throw new ResourceAccessForbiddenException({
        message: 'image token user_id mismatch',
        data: { token_payload: tokenPayload, user_id: userModel.entity_id }
      })
    }
    const imagePath = tokenPayload.image_path
    profileModel.profile_photo = imagePath
  }

  updateCoverPhotoUsingImageToken(
    userModel: UserModel,
    profileModel: ProfileModel,
    imageToken: string
  ){
    const tokenPayload = this.iAuthImageTokenService.parse(
      userModel.entity_id,
      imageToken
    )
    if (tokenPayload.type !== 'cover_photo') {
      throw new BadRequestException({
        message: 'image token type must be cover photo',
        data: { token_payload: tokenPayload }
      })
    }
    /**
     * Ensures that the image token is for the user
     */
    if (tokenPayload.upload_for_entity_id !== userModel.entity_id) {
      throw new ResourceAccessForbiddenException({
        message: 'image token user_id mismatch',
        data: { token_payload: tokenPayload, user_id: userModel.entity_id }
      })
    }
    const imagePath = tokenPayload.image_path
    profileModel.cover_photo = imagePath
  }

}