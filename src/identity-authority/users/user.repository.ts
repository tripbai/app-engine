import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { UserModel } from "./user.model";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { IdentityAuthority } from "../module/module.interface";
import { DataIntegrityException } from "../../core/exceptions/exceptions";

@injectable()
export class UserRepository extends BaseRepository<UserModel> {
  
  protected collection: string = 'users'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
      UserModel,
      DatabaseProvider,
      CacheProvider
    )
  }


  async getByUsername(
    username: IdentityAuthority.Users.Fields.Username
  ){
    return this.getByKeyValue('username', username)
  }

  async getByEmailAddress(
    emailAddress: IdentityAuthority.Users.Fields.EmailAddress
  ){
    return this.getByKeyValue('email_address', emailAddress)
  }

  private async getByKeyValue(
    fieldName: keyof UserModel,
    value: string
  ){
    await this.DatabaseProvider.connect()
    const results 
      = await this.DatabaseProvider.whereFieldHasValue(
        this.collection,
        fieldName,
        value
      )
    if (results.length > 1) {
      let message = `multiple instances of users that use the same`
        message += `${fieldName} have been detected`
      throw new Error(message)
    }
    if (results.length === 0) return null
    const userModel = new UserModel()
    this.ingest(userModel, results[0])
    return userModel
  }
  

}