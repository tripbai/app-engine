import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { TenantModel } from "./tenant.model";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";

@injectable()
export class TenantRepository extends BaseRepository<TenantModel> {

  protected collection: string = 'tenants'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
      TenantModel,
      DatabaseProvider,
      CacheProvider
    )
  }

}