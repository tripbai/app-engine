import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { FeatureModel } from "./feature.model";

@injectable()
export class FeatureRepository extends BaseRepository<FeatureModel> {

protected collection: string = 'features'

  constructor(
    @inject(AbstractDatabaseProvider) public readonly DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) public readonly CacheProvider: AbstractCacheProvider
  ){
    super(
    FeatureModel,
    DatabaseProvider,
    CacheProvider
    )
  }

}
