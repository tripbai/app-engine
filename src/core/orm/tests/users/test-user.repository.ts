import { injectable, inject } from "inversify";
import { BaseRepository } from "../../repository/base-repository";
import { TestUserModel } from "./test-user.model";
import { AbstractCacheProvider } from "../../../providers/cache/cache.provider";
import { AbstractDatabaseProvider, DatabaseTransactionStep } from "../../../providers/database/database.provider";

@injectable()
export class TestUserRepository extends BaseRepository<TestUserModel> {
  
  protected collection: string = 'users'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
      TestUserModel,
      DatabaseProvider,
      CacheProvider
    )
  }

}