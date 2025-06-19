import { inject, injectable } from "inversify";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { FeatureModel } from "./feature.model";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { FeaturesList } from "./features.list";
import { Core } from "../../core/module/module";
import { DataIntegrityException } from "../../core/exceptions/exceptions";

@injectable()
export class DefaultFeaturesRepository extends BaseRepository<FeatureModel>{

  protected collection: string = 'default_features'

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

  getFeatureKey<T extends keyof FeaturesList>(key: T){
    return {
      byPackageId: async (package_id: Core.Entity.Id ): Promise<InstanceType<FeaturesList[T]> | null> => {
        await this.DatabaseProvider.connect()
        const features = await this.DatabaseProvider.whereFieldHasValue(
          this.collection, 'package_id', package_id
        )
        const filtered = features.filter(FeatureModel => {
          return FeatureModel.key === key
        })
        if (filtered.length > 1) {
          throw new DataIntegrityException({
            message: 'duplicate default feature entry detected',
            data: {
              key: key,
              package_id: filtered[0].package_id
            }
          })
        }
        if (filtered.length === 0) {
          return null
        }
        const FeatMap = new FeaturesList
        const FeatObject = new FeatMap[key]
        for (const key in filtered[0]) {
          FeatObject[key] = filtered[0][key]
        }
        return FeatObject as InstanceType<FeaturesList[T]>
      }
    }
  }

  async createDefaultFeature<T extends keyof FeaturesList>(
    key: T,
    featureModel: InstanceType<FeaturesList[T]>
  ): Promise<void> {
    await this.DatabaseProvider.connect()
    const transaction = this.create(
      featureModel.entity_id,
      {
        key: key,
        value: featureModel.get(),
        category: featureModel.category,
        package_id: featureModel.package_id,
        featurable_entity_id: null,
        description: featureModel.description,
        org_mutable: featureModel.org_mutable,
        archived_at: null
      }
    )
    await this.DatabaseProvider.beginTransaction([transaction])
  }


}