import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { StoreModel } from "./store.model";

@injectable()
export class StoreRepository extends BaseRepository<StoreModel> {
  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super("stores", StoreModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }

  async getStoresByOrganizationId(
    organizationId: string
  ): Promise<StoreModel[]> {
    throw new Error("Method not implemented.");
  }
}
