import { inject, injectable } from "inversify";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { FeatureModel } from "./feature.model";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { FeaturesList } from "./features.list";
import * as Core from "../../core/module/types";
import { DataIntegrityException } from "../../core/exceptions/exceptions";
import { UnitOfWorkFactory } from "../../core/workflow/unit-of-work.factory";

@injectable()
export class DefaultFeaturesRepository extends BaseRepository<FeatureModel> {
  protected collectionName: string = "default_features";

  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider,
    @inject(UnitOfWorkFactory) private UnitOfWorkFactory: UnitOfWorkFactory
  ) {
    super("default_features", FeatureModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }

  getFeatureKey<T extends keyof FeaturesList>(key: T) {
    return {
      byPackageId: async (
        package_id: Core.Entity.Id
      ): Promise<InstanceType<FeaturesList[T]> | null> => {
        await this.DatabaseProvider.connect();
        const features = await this.DatabaseProvider.whereFieldHasValue(
          this.collectionName,
          "package_id",
          package_id
        );
        const filtered = features.filter((FeatureModel) => {
          return FeatureModel.key === key;
        });
        if (filtered.length > 1) {
          throw new DataIntegrityException({
            message: "duplicate default feature entry detected",
            data: {
              key: key,
              package_id: filtered[0].package_id,
            },
          });
        }
        if (filtered.length === 0) {
          return null;
        }
        const FeatMap = new FeaturesList();
        const FeatObject = new FeatMap[key]();
        this.ingestIntoModel(FeatObject, filtered[0]);
        return FeatObject as InstanceType<FeaturesList[T]>;
      },
    };
  }

  async createDefaultFeature<T extends keyof FeaturesList>(
    key: T,
    featureModel: InstanceType<FeaturesList[T]>
  ): Promise<void> {
    await this.DatabaseProvider.connect();
    const unitOfWork = this.UnitOfWorkFactory.create();
    this.create(
      {
        key: key,
        value: featureModel.get(),
        category: featureModel.category,
        package_id: featureModel.package_id,
        featurable_entity_id: null,
        description: featureModel.description,
        org_mutable: featureModel.org_mutable,
      },
      unitOfWork
    );
    await unitOfWork.commit();
  }
}
