import { inject, injectable } from "inversify";
import { UserRepository } from "./user.repository";
import { IdentityAuthority } from "../module/module.interface";
import { UserValidator } from "./user.validator";
import { IsValid } from "../../core/helpers/isvalid";
import { RecordAlreadyExistsException } from "../../core/exceptions/exceptions";

@injectable()
export class UserAssertions {

  constructor(
    @inject(UserRepository) public readonly userRepository: UserRepository
  ){}

  isUsername(value: unknown): asserts value is IdentityAuthority.Users.Fields.Username {
    IsValid.NonEmptyString(value)
    UserValidator.username(value)
  }

  isEmailAddress(value: unknown): asserts value is IdentityAuthority.Users.Fields.EmailAddress {
    IsValid.NonEmptyString(value)
    UserValidator.email_address(value)
  }

  isType(value: unknown): asserts value is IdentityAuthority.Users.Type {
    IsValid.NonEmptyString(value)
    UserValidator.type(value)
  }

  isRawPassword(value: unknown): asserts value is IdentityAuthority.Users.Fields.RawPassword {
    IsValid.NonEmptyString(value)
    UserValidator.password(value)
  }

  isProvider(value: unknown): asserts value is IdentityAuthority.Providers.Identity {
    IsValid.NonEmptyString(value)
    UserValidator.identity_provider(value)
  }

  isCreationContext(value: unknown): asserts value is 'external' | 'internal' {
    IsValid.NonEmptyString(value)
    UserValidator.creation_context(value)
  }

  isRole(value: unknown): asserts value is 'webadmin' | 'user' | 'moderator' {
    IsValid.NonEmptyString(value)
    UserValidator.role(value)
  }

  async isUniqueUsername(value: unknown): Promise<IdentityAuthority.Users.Fields.UniqueUsername> {
    this.isUsername(value)
    if (await this.userRepository.getByUsername(value) !== null) {
      throw new RecordAlreadyExistsException({
        message: 'user already exists with the same username',
        data: { username: value }
      })
    }
    /** Stupid conversion, maybe refactor in the future? */
    let result = value as string
    return result as IdentityAuthority.Users.Fields.UniqueUsername
  }

  async isUniqueEmailAddress(value: unknown): Promise<IdentityAuthority.Users.Fields.UniqueEmailAddress> {
    this.isEmailAddress(value)
    if (await this.userRepository.getByEmailAddress(value) !== null) {
      throw new RecordAlreadyExistsException({
        message: 'user already exists with the same email address',
        data: { email_address: value }
      })
    }
    /** Stupid conversion, maybe refactor in the future? */
    let result = value as string
    return result as IdentityAuthority.Users.Fields.UniqueEmailAddress
  }

}