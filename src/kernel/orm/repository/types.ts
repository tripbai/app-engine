import { CacheProviderInterface } from "../../services/cache/interface"
import { DatabaseProviderInterface } from "../../services/database/interface"

/** Declaration of Service Providers */
export type RepositoryServiceProviders = {
  database: DatabaseProviderInterface
  cache: CacheProviderInterface
}

export type RepositoryGetOptions = {
  allow_archived_record: boolean
}