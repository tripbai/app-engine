import { inject, injectable } from "inversify";
import { IdentityAuthority } from "../../module/module.interface";
import { UserAssertions } from "../user.assertions";
import { Core } from "../../../core/module/module";
import { UserRepository } from "../user.repository";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import { UserModel } from "../user.model";
import { UserPasswordService } from "./user-password.service";

@injectable()
export class UserUpdateService {

  constructor(
    @inject(UserAssertions) public readonly userAssertions: UserAssertions,
    @inject(UserPasswordService) public readonly userPasswordService: UserPasswordService
  ){}

  async updateUsername(
    userModel: UserModel,
    username: IdentityAuthority.Users.Fields.Username
  ): Promise<void> {

    const uniqueUsername = await this.userAssertions.isUniqueUsername(username)
    if (userModel.status !== 'active' && userModel.status !== 'unverified') {
      throw new ResourceAccessForbiddenException({
        message: 'cannot update user when user is not active or unverified',
        data: { user_id: userModel.entity_id, status: userModel.status }
      })
    }
    userModel.username = uniqueUsername  
  }

  async generateUpdateEmailToken(
    userModel: UserModel
  ): Promise<void> {
    
  }

  async updateEmailUsingToken(
    userModel: UserModel,
    token: string
  ): Promise<void> {
    
  }

  async updatePasswordUsingCurrentPassword(
    userModel: UserModel,
    newPassword: IdentityAuthority.Users.Fields.RawPassword,
    currentPassword: IdentityAuthority.Users.Fields.RawPassword
  ): Promise<void> {
    if (!this.userPasswordService.verifyPassword(
      currentPassword, 
      userModel.password_hash
    )) {
      throw new ResourceAccessForbiddenException({
        message: 'invalid credentials when trying to update password',
        data: {user_id: userModel.entity_id}
      })
    }
    const newPasswordHash = await this.userPasswordService.hashPassword(newPassword)
    userModel.password_hash = newPasswordHash
  }

  async generateUpdatePasswordToken(
    userModel: UserModel,
  ){
    
  }

  async updatePasswordUsingToken(
    userModel: UserModel,
    token: string
  ){

  }



}