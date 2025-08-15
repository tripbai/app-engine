import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { TeamModel } from "./team.model";
import { IAuthDatabaseProvider } from "../providers/iauth-database.provider";

@injectable()
export class TeamRepository extends BaseRepository<TeamModel> {
  protected collection: string = "teams";

  constructor(
    @inject(IAuthDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super(TeamModel, DatabaseProvider, CacheProvider);
  }
}
