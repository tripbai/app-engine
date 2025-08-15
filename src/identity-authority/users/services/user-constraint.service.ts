import { inject, injectable } from "inversify";
import { UserRepository } from "../user.repository";
import * as IdentityAuthority from "../../module/types";
import { assertIsEmailAddress, assertIsUsername } from "../user.assertions";
import { RecordAlreadyExistsException } from "../../../core/exceptions/exceptions";

@injectable()
export class UserConstraintService {
  constructor(@inject(UserRepository) private userRepository: UserRepository) {}

  async isUniqueUsername(
    value: unknown
  ): Promise<IdentityAuthority.Users.Fields.UniqueUsername> {
    assertIsUsername(value);
    if ((await this.userRepository.getByUsername(value)) !== null) {
      throw new RecordAlreadyExistsException({
        message: "user already exists with the same username",
        data: { username: value },
      });
    }
    /** Stupid conversion, maybe refactor in the future? */
    let result = value as string;
    return result as IdentityAuthority.Users.Fields.UniqueUsername;
  }

  async isUniqueEmailAddress(
    value: unknown
  ): Promise<IdentityAuthority.Users.Fields.UniqueEmailAddress> {
    assertIsEmailAddress(value);
    if ((await this.userRepository.getByEmailAddress(value)) !== null) {
      throw new RecordAlreadyExistsException({
        message: "user already exists with the same email address",
        data: { email_address: value },
      });
    }
    /** Stupid conversion, maybe refactor in the future? */
    let result = value as string;
    return result as IdentityAuthority.Users.Fields.UniqueEmailAddress;
  }
}
