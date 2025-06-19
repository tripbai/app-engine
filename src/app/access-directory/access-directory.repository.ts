import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AccessDirectoryModel } from "./access-directory.model";
import { Core } from "../../core/module/module";

@injectable()
export class AccessDirectoryRepository extends BaseRepository<AccessDirectoryModel> {

protected collection: string = 'access_directory'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
      AccessDirectoryModel,
      DatabaseProvider,
      CacheProvider
    )
  }

}
