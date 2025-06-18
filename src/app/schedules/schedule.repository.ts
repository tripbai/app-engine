import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { ScheduleModel } from "./schedule.model";

@injectable()
export class ScheduleRepository extends BaseRepository<ScheduleModel> {

protected collection: string = 'schedules'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
    ScheduleModel,
    DatabaseProvider,
    CacheProvider
    )
  }

}
