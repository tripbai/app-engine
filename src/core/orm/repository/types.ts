import { AbstractCacheProvider } from "../../providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../providers/database/database.provider";

/** Declaration of Service Providers */
export type RepositoryServiceProviders = {
  database: AbstractDatabaseProvider;
  cache: AbstractCacheProvider;
};

export type PartiallyReadonly<T, K extends keyof T> = Readonly<Pick<T, K>> &
  Omit<T, K>;
