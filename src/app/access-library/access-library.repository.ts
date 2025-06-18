import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { Access-libraryModel } from "./access-library.model";

@injectable()
export class Access-libraryRepository extends BaseRepository<Access-libraryModel> {

protected collection: string = 'access-library'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
    Access-libraryModel,
    DatabaseProvider,
    CacheProvider
    )
  }

}
