import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { UserModel } from "./user.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import * as IdentityAuthority from "../module/types";
import { DataIntegrityException } from "../../core/exceptions/exceptions";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

@injectable()
export class UserRepository extends BaseRepository<UserModel> {
  constructor(
    @inject(IAuthDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider)
    private CacheProvider: AbstractCacheProvider
  ) {
    super("users", UserModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }

  async getByUsername(username: IdentityAuthority.Users.Fields.Username) {
    return this.getByKeyValue("username", username);
  }

  async getByEmailAddress(
    emailAddress: IdentityAuthority.Users.Fields.EmailAddress
  ) {
    return this.getByKeyValue("email_address", emailAddress);
  }

  private async getByKeyValue(fieldName: keyof UserModel, value: string) {
    await this.DatabaseProvider.connect();
    const results = await this.DatabaseProvider.whereFieldHasValue(
      "users",
      fieldName,
      value
    );
    if (results.length > 1) {
      let message = `multiple instances of users that use the same`;
      message += `${fieldName} have been detected`;
      throw new Error(message);
    }
    if (results.length === 0) return null;
    const userModel = new UserModel();
    this.ingestIntoModel(userModel, results[0]);
    return userModel;
  }
}
