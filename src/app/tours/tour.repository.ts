import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { TourModel } from "./tour.model";

@injectable()
export class TourRepository extends BaseRepository<TourModel> {
  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super("tours", TourModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }
}
