import { AtomicCacheService } from "../../../services/cache/atomic/atomic.cache.service";
import { DatabaseProviderInterface } from "../../../services/database/interface";
import { SessionDBClient } from "../../../services/database/sessiondb/sessiondb";
import { BaseRepository } from "../../repository/base.repository";
import { RepositoryServiceProviders } from "../../repository/types";
import { TestUser } from "./test-user.model";

export class TestUserRepository extends BaseRepository<TestUser> {

  protected collection = 'users'
  protected model = new TestUser
  protected providers = {
    database: new SessionDBClient,
    cache: new AtomicCacheService
  }

  setDatabaseProvider(provider: SessionDBClient){
    this.providers.database = provider
  }

}