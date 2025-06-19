import { inject, injectable } from "inversify";
import { FeaturesList } from "../features.list";
import { Core } from "../../../core/module/module";
import { DefaultFeaturesRepository } from "../default-features.repository";
import { FeaturesOverrideRepository } from "../feature-overrides.repository";
import { LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class FeatureGetService {

  constructor(
    @inject(DefaultFeaturesRepository) public readonly defaultFeaturesRepository: DefaultFeaturesRepository,
    @inject(FeaturesOverrideRepository) public readonly featuresOverrideRepository: FeaturesOverrideRepository
  ) {}

  /**
   * Retrieves default feature data from default_features table, 
   * otherwise, returns data from feature_overrides if overriden.
   * @param params 
   * @returns 
   */
  async getFeatureByKey<T extends keyof FeaturesList>(params: {
    featureKey: T,
    packageId: Core.Entity.Id,
    ownerId: Core.Entity.Id
  }){
    const [defaultFeature, overrideFeature] = await Promise.all([
      this.defaultFeaturesRepository.getFeatureKey(params.featureKey).byPackageId(params.packageId),
      this.featuresOverrideRepository.getFeatureKeyOfPackage(params.featureKey, params.packageId).ownedByEntityId(params.ownerId)
    ])
    if (defaultFeature === null) {
      throw new LogicException({
        message: 'feature does not exist in the default feature registry',
        data: { key: params.featureKey }
      })
    }
    if (overrideFeature === null) {
      return defaultFeature
    }
    return overrideFeature
  }

}