import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AccessLibraryModel } from "./access-library.model";

@injectable()
export class AccessLibraryRepository extends BaseRepository<AccessLibraryModel> {

protected collection: string = 'access_library'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
    AccessLibraryModel,
    DatabaseProvider,
    CacheProvider
    )
  }

}
