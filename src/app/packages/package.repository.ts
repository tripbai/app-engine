import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { PackageModel } from "./package.model";
import { DataIntegrityException } from "../../core/exceptions/exceptions";

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

  async getAllNonArchivedPackages(){
    const models: Array<PackageModel> = []
    const results = await this.DatabaseProvider.whereFieldHasValue(
      this.collection, 'archived_at', null
    )
    if (results.length === 0) {
      return models
    }
    for (let i = 0; i < results.length; i++) {
      const data = results[i]
      const Registry: PackageModel = new PackageModel
      try {
        for (const key in data) {
          if (BaseRepository.isDateObject(data[key])) {
            // @ts-expect-error the above check will determine if the value is Date object
            Registry[key] = TimeStamp.normalize(data[key])
          } else {
            Registry[key] = data[key]
          }
        }
      } catch (error) {
        throw new DataIntegrityException({
          message: 'one of package records contains invalid data',
          data: {
            email_template: data,
            error: error
          }
        })
      }
      models.push(Registry)
    }
    return models
  }

}
