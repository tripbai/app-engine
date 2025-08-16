import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AccessDirectoryModel } from "./access-directory.model";
import * as Core from "../../core/module/types";

@injectable()
export class AccessDirectoryRepository extends BaseRepository<AccessDirectoryModel> {
  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
  ) {
    super("access_directory", AccessDirectoryModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }
}
