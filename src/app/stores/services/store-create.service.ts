import { inject, injectable } from "inversify";
import { StoreRepository } from "../store.repository";
import { OrganizationRequester } from "../../requester/organization-requester";
import { OrganizationModel } from "../../organizations/organization.model";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { FeatureGetService } from "../../features/services/feature-get.service";
import { PackageModel } from "../../packages/package.model";
import { StoreOrganizationRegistry } from "../store-organization.registry";
import { PackageRepository } from "../../packages/package.repository";
import { StoreModel } from "../store.model";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { TimeStamp } from "../../../core/helpers/timestamp";
import { StoreValidator } from "../store.validator";

@injectable()
export class StoreCreateService {

  constructor(
    @inject(StoreRepository) public readonly storeRepository: StoreRepository,
    @inject(FeatureGetService) public readonly featureGetService: FeatureGetService,
    @inject(StoreOrganizationRegistry) public readonly storeOrganizationRegistry: StoreOrganizationRegistry,
    @inject(PackageRepository) public readonly packageRepository: PackageRepository
  ) {}

  async createStore(params: {
    requester: OrganizationRequester,
    organizationModel: OrganizationModel,
    name: string
  }){
    this.assertRequesterCanCreateStore(params.requester, params.organizationModel)
    this.assertOrganizationCanCreateStore(params.organizationModel)
    const packageId = params.organizationModel.package_id
    const packageModel = await this.packageRepository.getById(packageId)
    if (await this.hasStoreLimitReached(params.organizationModel, packageModel)) {
      throw new ResourceAccessForbiddenException({
        message: 'Organization has reached its store limit',
        data: { organization_id: params.organizationModel.entity_id }
      })
    }
    StoreValidator.name(params.name)
    const storeModel: StoreModel = {
      entity_id: Pseudorandom.alphanum32(),
      organization_id: params.organizationModel.entity_id,
      name: params.name,
      profile_photo_src: null,
      cover_photo_src: null,
      package_id: this.assignDefaultPackageToStore(params.organizationModel),
      about: null,
      language: this.assignDefaultLanguageToStore(),
      location_id: null,
      secret_key: Pseudorandom.alphanum32(),
      status: 'active',
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null
    }
    return storeModel
  }

  assertRequesterCanCreateStore(
    requester: OrganizationRequester,
    organizationModel: OrganizationModel
  ){
    if (!requester.isOrganizationAdminOf(organizationModel.entity_id)) {
      throw new ResourceAccessForbiddenException({
        message: 'Only organization admins can create stores',
        data: { organization_id: organizationModel.entity_id }
      })
    }
  }

  assertOrganizationCanCreateStore(
    organizationModel: OrganizationModel
  ) {
    if (organizationModel.status !== 'active') {
      throw new ResourceAccessForbiddenException({
        message: 'Organization is not allowed to create stores due to its current status',
        data: { organization_id: organizationModel.entity_id }
      })
    }
  }

  assignDefaultLanguageToStore(){
    return 'us-en'; // Default language for the store
  }

  /**
   * Assigns a package to the store based on the organization model.
   * By default it returns the package_id from the organization model.
   * @param organizationModel 
   * @returns 
   */
  assignDefaultPackageToStore(
    organizationModel: OrganizationModel,
  ){
    return organizationModel.package_id
  }

  /**
   * Checks if the organization has reached its store limit based on the package model.
   * @param organizationModel 
   * @param packageModel 
   * @returns 
   */
  async hasStoreLimitReached(
    organizationModel: OrganizationModel,
    packageModel: PackageModel
  ){
    const maxStoreAllowedFeature = 
      await this.featureGetService.getFeatureByKey({
        featureKey: 'max_store_allowed',
        packageId: packageModel.entity_id,
        ownerId: organizationModel.entity_id
      });
    const totalAllowedStores = parseInt(maxStoreAllowedFeature.value);
    const listOfStores = await this.storeOrganizationRegistry.getActiveStoresByOrganizationId(organizationModel.entity_id)
    return listOfStores.length >= totalAllowedStores;
  }

}