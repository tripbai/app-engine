import { inject, injectable } from "inversify";
import { BaseRepository } from "../../core/orm/repository/base-repository";
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
import { FeatureModel } from "./feature.model";
import { FeaturesList } from "./features.list";
import * as Core from "../../core/module/types";
import { DataIntegrityException } from "../../core/exceptions/exceptions";
import { UnitOfWorkFactory } from "../../core/workflow/unit-of-work.factory";

@injectable()
export class FeaturesOverrideRepository extends BaseRepository<FeatureModel> {
  protected collectionName: string = "feature_overrides";

  constructor(
    @inject(AbstractDatabaseProvider)
    private DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider)
    private CacheProvider: AbstractCacheProvider,
    @inject(UnitOfWorkFactory) private UnitOfWorkFactory: UnitOfWorkFactory
  ) {
    super("feature_overrides", FeatureModel, {
      database: DatabaseProvider,
      cache: CacheProvider,
    });
  }

  getFeatureKeyOfPackage<T extends keyof FeaturesList>(
    key: T,
    packageId: Core.Entity.Id
  ) {
    return {
      ownedByEntityId: async (
        ownerId: Core.Entity.Id
      ): Promise<InstanceType<FeaturesList[T]> | null> => {
        await this.DatabaseProvider.connect();
        const features = await this.DatabaseProvider.whereFieldHasValue(
          this.collectionName,
          "featurable_entity_id",
          ownerId
        );
        const filtered = features.filter((FeatureModel) => {
          return (
            FeatureModel.key === key && FeatureModel.package_id === packageId
          );
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

  async createFeatureOverride<T extends keyof FeaturesList>(
    key: T,
    featureModel: InstanceType<FeaturesList[T]>
  ) {
    await this.DatabaseProvider.connect();
    const unitOfWork = this.UnitOfWorkFactory.create();
    this.create(
      {
        key: key,
        value: featureModel.get(),
        category: featureModel.category,
        package_id: featureModel.package_id,
        featurable_entity_id: featureModel.featurable_entity_id,
        description: featureModel.description,
        org_mutable: featureModel.org_mutable,
      },
      unitOfWork
    );
    await unitOfWork.commit();
  }
}
