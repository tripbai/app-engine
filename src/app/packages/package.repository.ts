import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { PackageModel } from "./package.model";

@injectable()
export class PackageRepository extends BaseRepository<PackageModel> {

protected collection: string = 'packages'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
    PackageModel,
    DatabaseProvider,
    CacheProvider
    )
  }

}
