import { inject, injectable } from "inversify";
import { get } from "../../../core/router/decorators";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { UserPermissionService } from "../services/user-permission.service";
import { IAuthPermissionsService } from "../../services/iauth-permissions.service";
import { UserRepository } from "../user.repository";
import { ProfileRepository } from "../../profiles/profile.repository";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class UserGetController {

  constructor(
    @inject(IAuthPermissionsService) public readonly iAuthPermissionService: IAuthPermissionsService,
    @inject(UserRepository) public readonly userRepository: UserRepository,
    @inject(ProfileRepository) public readonly profileRepository: ProfileRepository
  ){}

  @get<IdentityAuthority.Users.Endpoints.GetSelf>('identity-authority/user/me')
  async me<T extends IdentityAuthority.Users.Endpoints.GetSelf>(params: Core.Route.ControllerDTO<T>): Promise<T['response']>{
    this.iAuthPermissionService.isRequesterHasBasicUserPermission(params.requester)
    const userModel = await this.userRepository.getById(params.requester.user.entity_id)
    const profileModel = await this.profileRepository.getById(params.requester.user.entity_id)
    return {
      entity_id: userModel.entity_id,
      first_name: profileModel.first_name,
      last_name: profileModel.last_name,
      profile_photo: profileModel.profile_photo,
      cover_photo: profileModel.cover_photo,
      about: profileModel.about,
      username: userModel.username,
      email_address: userModel.email_address,
      is_email_verified: userModel.is_email_verified,
      user_type: userModel.type,
      status: userModel.status,
      verified_since: userModel.verified_since,
      role: userModel.role
    }
  }

  @get<IdentityAuthority.Users.Endpoints.GetModel>('identity-authority/users/:user_id')
  async getUserModel<T extends IdentityAuthority.Users.Endpoints.GetModel>(params: Core.Route.ControllerDTO<T>): Promise<T['response']>{
    try {
      IsValid.NonEmptyString(params.data.user_id)
      EntityToolkit.Assert.idIsValid(params.data.user_id)
    } catch (error) {
      throw new BadRequestException({
        message: 'invalid user id',
        data: {user_id: params.data.user_id}
      })
    }
    this.iAuthPermissionService.isRequesterHasBasicUserPermission(params.requester)
    this.iAuthPermissionService.canRequesterOperateThisUser(params.requester, params.data.user_id)
    const userModel = await this.userRepository.getById(params.requester.user.entity_id)
    return {
      identity_provider: userModel.identity_provider,
      email_address: userModel.email_address,
      username: userModel.username,
      is_email_verified: userModel.is_email_verified,
      verified_since: userModel.verified_since,
      suspended_until: userModel.suspended_until,
      creation_context: userModel.creation_context,
      role: userModel.role,
      status: userModel.status,
      type: userModel.type,
    }
  } 

}