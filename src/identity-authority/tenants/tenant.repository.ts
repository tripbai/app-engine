import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { TenantModel } from "./tenant.model";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

@injectable()
export class TenantRepository extends BaseRepository<TenantModel> {
  constructor(
    @inject(IAuthDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super("tenants", TenantModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }
}
