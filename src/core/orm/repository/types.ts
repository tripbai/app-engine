import { AbstractCacheProvider } from "../../providers/cache/cache.provider"
import { AbstractDatabaseProvider } from "../../providers/database/database.provider"

/** Declaration of Service Providers */
export type RepositoryServiceProviders = {
  database: AbstractDatabaseProvider
  cache: AbstractCacheProvider
}

export type RepositoryGetOptions = {
  allow_archived_record: boolean
}