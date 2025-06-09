import { inject, injectable } from "inversify";
import { UserCreateService } from "../services/user-create.service";
import { ProfileCreateService } from "../../profiles/services/profile-create.service";
import { IdentityAuthority } from "../../module/module.interface";
import { UserModel } from "../user.model";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { UserRepository } from "../user.repository";
import { ProfileRepository } from "../../profiles/profile.repository";
import { RequesterTokenService } from "../../../core/requester/requester-token.service";
import { UserPermissionService } from "../services/user-permission.service";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { UserAssertions } from "../user.assertions";

@injectable()
export class CreateUserCommand {

  constructor(
    @inject(UserCreateService) public readonly userCreateService: UserCreateService,
    @inject(UserRepository) public readonly userRepository: UserRepository,
    @inject(ProfileCreateService) public readonly profileCreateService: ProfileCreateService,
    @inject(ProfileRepository) public readonly profileRepository: ProfileRepository,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(RequesterTokenService) public readonly requesterTokenService: RequesterTokenService,
    @inject(UserPermissionService) public readonly userPermissionService: UserPermissionService,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions
  ){}

  async execute(
    params: {
      provider: IdentityAuthority.Providers.Identity,
      first_name: IdentityAuthority.Profile.Fields.FirstName,
      last_name: IdentityAuthority.Profile.Fields.LastName,
      username: IdentityAuthority.Users.Fields.Username,
      email_address: IdentityAuthority.Users.Fields.EmailAddress,
      password: IdentityAuthority.Users.Fields.RawPassword | null
      type: IdentityAuthority.Users.Type
      creation_context: UserModel['creation_context']
      role: UserModel['role']
      status: IdentityAuthority.Users.Status.Type
    }
  ): Promise<IdentityAuthority.Users.Endpoints.Create['response']> {
    const unitOfWork = this.unitOfWorkFactory.create()

    let userModel = new UserModel

    if (
      params.type === 'concrete' && 
      params.creation_context === 'external' && 
      params.provider === 'iauth' && 
      params.role === 'user' && 
      params.status === 'unverified'
    ){

      try {
        this.userAssertions.isRawPassword(params.password)
      } catch (error) {
        throw new BadRequestException({
          message: 'create user params validation failed',
          data: {error: error}
        })
      }

      userModel = await this.userCreateService.createIAuthUser(
        params.provider,
        params.creation_context,
        params.role,
        params.type,
        params.username,
        params.email_address,
        params.password,
        params.status
      )

      unitOfWork.addTransactionStep(
        this.userRepository.create(userModel.entity_id, {
          username: userModel.username,
          email_address: userModel.email_address,
          identity_provider: userModel.identity_provider,
          is_email_verified: userModel.is_email_verified,
          creation_context: userModel.creation_context,
          password_hash: userModel.password_hash ?? null,
          type: userModel.type,
          role: userModel.role,
          status: userModel.status,
          verified_since: userModel.verified_since,
          suspended_until: userModel.suspended_until,
          otp_secret: userModel.otp_secret,
          archived_at: userModel.archived_at
        }) 
      )


    } else {
      throw new BadRequestException({
        message: 'unsupported create user workflow',
        data: params
      })
    }

    const profileModel = this.profileCreateService.create(
      userModel.entity_id,
      params.first_name,
      params.last_name,
      null,
      null,
      null
    )
    unitOfWork.addTransactionStep(
      this.profileRepository.create(userModel.entity_id, {
        first_name: profileModel.first_name,
        last_name: profileModel.last_name,
        profile_photo: profileModel.profile_photo,
        cover_photo: profileModel.cover_photo,
        about: profileModel.about,
        archived_at: profileModel.archived_at
      })
    )
    

    await unitOfWork.commit()

    const token = this.requesterTokenService.generate({
      user: { id: userModel.entity_id, status: userModel.status },
      permissions: this.userPermissionService.addPermissionsByRole(
        [], userModel.entity_id, userModel.role
      )
    })
    
    return {
      type: params.type,
      context: params.creation_context,
      provider: params.provider,
      role: params.role,
      user_id: userModel.entity_id,
      first_name: profileModel.first_name,
      last_name: profileModel.last_name,
      username: userModel.username,
      email_address: userModel.email_address,
      status: params.status,
      iauth_token: token,
    }
  }

}