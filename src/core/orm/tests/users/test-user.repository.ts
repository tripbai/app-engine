import { injectable, inject } from "inversify";
import { BaseRepository } from "../../repository/base-repository";
import { TestUserModel } from "./test-user.model";
import { AbstractCacheProvider } from "../../../providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../../providers/database/database.provider";

@injectable()
export class TestUserRepository extends BaseRepository<TestUserModel> {
  
  protected collection: string = 'users'

  constructor(
    @inject(AbstractDatabaseProvider) DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) CacheProvider: AbstractCacheProvider
  ){
    super(
      TestUserModel,
      DatabaseProvider,
      CacheProvider
    )
  }

}