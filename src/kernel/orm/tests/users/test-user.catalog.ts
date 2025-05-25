import { AtomicCacheService } from "../../../services/cache/atomic/atomic.cache.service";
import { SessionDBClient } from "../../../services/database/sessiondb/sessiondb";
import { CatalogRepository } from "../../repository/catalog.repository";
import { RepositoryServiceProviders } from "../../repository/types";
import { TestUser } from "./test-user.model";
import { getTestUsers } from "./test-users";

const SessionDB = new SessionDBClient()
SessionDB.import({users: getTestUsers()})

export class TestUserCatalogRepository extends CatalogRepository<TestUser> {
  protected collection: string = 'users'
  protected model: new (...args: any[]) => TestUser = TestUser
  protected providers: RepositoryServiceProviders = {
    cache: new AtomicCacheService,
    database: SessionDB
  }
}