import { inject, injectable } from "inversify";
import { ProfileCreateService } from "../../profiles/services/profile-create.service";
import { UserRepository } from "../user.repository";
import { IdentityAuthority } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { TransactionManager } from "../../../core/transaction/transaction.manager";
import { UserModel } from "../user.model";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { UserPasswordService } from "./user-password.service";
import { TimeStamp } from "../../../core/helpers/timestamp";
import { UserOTPService } from "./user-otp.service";
import { ProfileModel } from "../../profiles/profile.model";
import { UserAssertions } from "../user.assertions";
import { ProfileAssertions } from "../../profiles/profile.assertions";
import { RequesterTokenService } from "../../../core/requester/requester-token.service";
import { UserPermissionService } from "./user-permission.service";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { AbstractDatabaseProvider } from "../../../core/providers/database/database.provider";

@injectable()
export class UserCreateService {

  constructor(
    @inject(ProfileCreateService) public readonly profileCreateService: ProfileCreateService,
    @inject(UserRepository) public readonly userRepository: UserRepository,
    @inject(UserPasswordService) public readonly userPasswordService: UserPasswordService,
    @inject(UserOTPService) public readonly userOTPService: UserOTPService,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions,
    @inject(ProfileAssertions) public readonly profileAssertions: ProfileAssertions,
    @inject(RequesterTokenService) public readonly requesterTokenService: RequesterTokenService,
    @inject(UserPermissionService) public readonly userPermissionService: UserPermissionService
  ){}

  async createUser(params: {
    provider: IdentityAuthority.Providers.Identity,
    first_name: IdentityAuthority.Profile.Fields.FirstName,
    last_name: IdentityAuthority.Profile.Fields.LastName,
    username: IdentityAuthority.Users.Fields.Username,
    email_address: IdentityAuthority.Users.Fields.EmailAddress,
    password: IdentityAuthority.Users.Fields.RawPassword | null
    type: IdentityAuthority.Users.Type
    creation_context: UserModel['creation_context']
    role: UserModel['role']
  }): Promise<IdentityAuthority.Users.Endpoints.Create['response']>{

    const transactionManager = new TransactionManager()

    const uniqueEmail = 
      await this.userAssertions.isUniqueEmailAddress(params.email_address)
    const uniqueUsername =
      await this.userAssertions.isUniqueUsername(params.username)


    if (
      params.type === 'concrete' && 
      params.creation_context === 'external' && 
      params.provider === 'iauth' && 
      params.role === 'user'
    ) {

      try {
        this.userAssertions.isRawPassword(params.password)
      } catch (error) {
        throw new BadRequestException({
          message: 'create user params validation failed',
          data: {error: error}
        })
      }
    
      const [userModel, profileModel] = await this.createConcreteIAuthUser(
        transactionManager,
        {
          type: params.type,
          context: params.creation_context,
          provider: params.provider,
          role: params.role,
          first_name: params.first_name,
          last_name: params.last_name,
          username: uniqueUsername,
          email_address: uniqueEmail,
          password: params.password
        }
      )
      const token = this.requesterTokenService.generate({
        user: { id: userModel.entity_id, status: userModel.status },
        permissions: this.userPermissionService.addPermissionsByRole(
          [], userModel.entity_id, userModel.role
        )
      })

      await transactionManager.commit()
      
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
        status: userModel.status,
        iauth_token: token,
      }

    } 

    throw new BadRequestException({
      message: 'invalid create user parameters',
      data: params
    })
  }

  async createConcreteIAuthUser (
    transactions: TransactionManager,
    data: Omit<(IdentityAuthority.Users.Endpoints.Create['request']['data'] & {
      type: 'concrete'
      context: 'external'
      provider: 'iauth'
      role: 'user'
    }), 'email_address' | 'username'> & {
      email_address: IdentityAuthority.Users.Fields.UniqueEmailAddress
      username: IdentityAuthority.Users.Fields.UniqueUsername
    }
  ): Promise<[Readonly<UserModel & {status: 'unverified'}>, Readonly<ProfileModel>]> {

    const userId = Pseudorandom.alphanum32()
    const hashedPassword = await this.userPasswordService.hashPassword(data.password)

    const userModel: Readonly<UserModel & {status: 'unverified'}> = {
      entity_id: userId,
      identity_provider: 'iauth',
      email_address: data.email_address,
      username: data.username,
      is_email_verified: false,
      verified_since: null,
      suspended_until: null,
      creation_context: 'external',
      role: 'user',
      password_hash: hashedPassword,
      /** Self-registered users are awlays unverified */
      status: 'unverified',
      type: 'concrete',
      otp_secret: this.userOTPService.generateOtpSecret(),
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null
    }

    const profileModel: Readonly<ProfileModel>  = {
      entity_id: userId,
      first_name: data.first_name,
      last_name: data.last_name,
      profile_photo: null,
      cover_photo: null,
      about: null,
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null
    }

    this.create(userModel, transactions)
    this.profileCreateService.create(profileModel, transactions)

    return [userModel, profileModel]
  }

  create(
    userModel: UserModel, 
    transactions: TransactionManager
  ){
    const transaction = this.userRepository.create(
      userModel.entity_id, 
      {
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
      }
    )
    transactions.stage(transaction)
  }


}