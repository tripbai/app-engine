import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { TeamModel } from "./team.model";

@injectable()
export class TeamRepository extends BaseRepository<TeamModel> {

  protected collection: string = 'teams'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
      TeamModel,
      DatabaseProvider,
      CacheProvider
    )
  }

}