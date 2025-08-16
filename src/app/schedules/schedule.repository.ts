import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { ScheduleModel } from "./schedule.model";

@injectable()
export class ScheduleRepository extends BaseRepository<ScheduleModel> {
  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super("schedules", ScheduleModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }
}
