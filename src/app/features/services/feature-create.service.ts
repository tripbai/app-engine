import { inject, injectable } from "inversify";
import * as Core from "../../../core/module/types";
import { PackageModel } from "../../packages/package.model";
import {
  BadRequestException,
  RecordAlreadyExistsException,
  RecordNotFoundException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { FeaturesList } from "../features.list";
import { DefaultFeaturesRepository } from "../default-features.repository";
import { OrganizationRequester } from "../../requester/organization-requester";
import { OrganizationModel } from "../../organizations/organization.model";
import { StoreModel } from "../../stores/store.model";
import { FeaturesOverrideRepository } from "../feature-overrides.repository";

@injectable()
export class FeatureCreateService {
  constructor(
    @inject(DefaultFeaturesRepository)
    private readonly defaultFeaturesRepository: DefaultFeaturesRepository,
    @inject(FeaturesOverrideRepository)
    private readonly featureOverrideRepository: FeaturesOverrideRepository
  ) {}

  async registerDefaultFeatureInPackage(params: {
    organizationRequester: OrganizationRequester;
    featureKey: keyof FeaturesList;
    featureValue: string;
    packageModel: PackageModel;
  }) {
    if (!params.organizationRequester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "only web admin can register feature to packages",
        data: {
          package_id: params.packageModel.entity_id,
          feature_key: params.featureKey,
          feature_value: params.featureValue,
        },
      });
    }
    if (params.packageModel.is_active === false) {
      throw new ResourceAccessForbiddenException({
        message: "adding features to inactive packages is forbidden",
        data: { package_id: params.packageModel.entity_id },
      });
    }
    const newFeatureId = createEntityId();
    await this.isFeatureExistsInPackage(params.featureKey, params.packageModel);
    const featureList = new FeaturesList();
    const featureModel = new featureList[params.featureKey]();
    featureModel.set(params.featureValue);
    featureModel.entity_id = newFeatureId;
    featureModel.package_id = params.packageModel.entity_id;
    await this.defaultFeaturesRepository.createDefaultFeature(
      params.featureKey,
      featureModel
    );
    return newFeatureId;
  }

  async createFeatureOverride(
    params:
      | {
          organizationRequester: OrganizationRequester;
          featurableEntityType: "store";
          organizationModel: OrganizationModel;
          storeModel: StoreModel;
          featureKey: keyof FeaturesList;
          overrideFeatureValue: string;
          packageModel: PackageModel;
        }
      | {
          organizationRequester: OrganizationRequester;
          featurableEntityType: "organization";
          organizationModel: OrganizationModel;
          featureKey: keyof FeaturesList;
          overrideFeatureValue: string;
          packageModel: PackageModel;
        }
  ) {
    const defaultFeature = await this.defaultFeaturesRepository
      .getFeatureKey(params.featureKey)
      .byPackageId(params.packageModel.entity_id);
    if (defaultFeature === null) {
      throw new RecordNotFoundException({
        message: "feature not found within package",
        data: {
          package_id: params.packageModel.entity_id,
          feature_key: params.featureKey,
        },
      });
    }
    // Check if the feature can be overridden by organization or store
    // If the feature cannot be overriden by organization or store, and
    // the requester is not web admin, throw an error
    // Web admin has full access to override any feature for any organization
    if (
      !defaultFeature.org_mutable &&
      params.organizationRequester.isWebAdmin() === false
    ) {
      throw new ResourceAccessForbiddenException({
        message: "feature cannot be overridden by organization or store",
        data: {
          package_id: params.packageModel.entity_id,
          feature_key: params.featureKey,
        },
      });
    }
    let featurableEntityId: Core.Entity.Id | null = null;
    // If the feature override is for organization, check if
    // the requester is admin of the organization
    if (params.featurableEntityType === "organization") {
      featurableEntityId = params.organizationModel.entity_id;
      if (
        !params.organizationRequester.isOrganizationAdminOf(featurableEntityId)
      ) {
        throw new ResourceAccessForbiddenException({
          message:
            "only organization admin can register feature override for organization",
          data: {
            organization_id: featurableEntityId,
            feature_key: params.featureKey,
          },
        });
      }
    }
    // If the feature override is for store, check if
    // the requester has access or can operate the store
    if (params.featurableEntityType === "store") {
      if (
        params.storeModel.organization_id !== params.organizationModel.entity_id
      ) {
        throw new ResourceAccessForbiddenException({
          message: "store does not belong to the organization",
          data: {
            store_id: params.storeModel.entity_id,
            organization_id: params.organizationModel.entity_id,
          },
        });
      }
      featurableEntityId = params.storeModel.entity_id;
      if (
        !params.organizationRequester.canOperateStore({
          storeId: featurableEntityId,
          organizationId: params.organizationModel.entity_id,
        })
      ) {
        throw new ResourceAccessForbiddenException({
          message:
            "only user with store access can register feature override for store",
          data: {
            store_id: featurableEntityId,
            feature_key: params.featureKey,
          },
        });
      }
    }
    if (featurableEntityId === null) {
      throw new BadRequestException({
        message: "features can only be overriden for stores and organizations",
        data: {},
      });
    }
    // Checks if the feature override already exists
    await this.isFeatureAlreadyOverriden(
      params.featureKey,
      featurableEntityId,
      params.packageModel
    );
    // Create the feature override model
    defaultFeature.value = params.overrideFeatureValue;
    await this.featureOverrideRepository.createFeatureOverride(
      params.featureKey,
      defaultFeature
    );
  }

  async isFeatureAlreadyOverriden(
    featureKey: keyof FeaturesList,
    featurableEntityId: Core.Entity.Id,
    packageModel: PackageModel
  ) {
    const existingFeatureOverride = await this.featureOverrideRepository
      .getFeatureKeyOfPackage(featureKey, packageModel.entity_id)
      .ownedByEntityId(featurableEntityId);
    if (existingFeatureOverride !== null) {
      throw new RecordAlreadyExistsException({
        message: "feature override already exists within package",
        data: { package_id: packageModel.entity_id, feature_key: featureKey },
      });
    }
  }

  async isFeatureExistsInPackage(
    featureKey: keyof FeaturesList,
    packageModel: PackageModel
  ) {
    const exitingFeature = await this.defaultFeaturesRepository
      .getFeatureKey(featureKey)
      .byPackageId(packageModel.entity_id);
    if (exitingFeature !== null) {
      throw new ResourceAccessForbiddenException({
        message: "feature already exists within package",
        data: { package_id: packageModel.entity_id, feature_key: featureKey },
      });
    }
  }
}
