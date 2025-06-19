import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { FeatureCreateService } from "../services/feature-create.service";
import { StoreRepository } from "../../stores/store.repository";
import { OrganizationRepository } from "../../organizations/organization.repository";
import { FeaturesList } from "../features.list";
import { PackageRepository } from "../../packages/package.repository";

@injectable()
export class CreateFeatureOverrideCommand {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(FeatureCreateService) public readonly featureCreateService: FeatureCreateService,
    @inject(AbstractEventManagerProvider) public readonly abstractEventManagerProvider: AbstractEventManagerProvider,
    @inject(StoreRepository) public readonly storeRepository: StoreRepository,
    @inject(OrganizationRepository) public readonly organizationRepository: OrganizationRepository,
    @inject(PackageRepository) public readonly packageRepository: PackageRepository
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester,
    organizationId: Core.Entity.Id,
    featurableEntityType: 'store' | 'organization',
    featurableEntityId: Core.Entity.Id
    featureKey: keyof FeaturesList
    featureValue: string
    packageId: Core.Entity.Id
  }) {
    const unitOfWork = this.unitOfWorkFactory.create()
    const requester = this.organizationRequesterFactory.create(params.requester)
    const organizationModel = await this.organizationRepository.getById(params.organizationId)
    const packageModel = await this.packageRepository.getById(params.packageId)
    if (params.featurableEntityType === 'store') {
      const storeModel = await this.storeRepository.getById(params.featurableEntityId)
      await this.featureCreateService.createFeatureOverride({
        organizationRequester: requester,
        featurableEntityType: 'store',
        storeModel: storeModel,
        organizationModel: organizationModel,
        featureKey: params.featureKey,
        overrideFeatureValue: params.featureValue,
        packageModel: packageModel
      })
    } else {
      await this.featureCreateService.createFeatureOverride({
        organizationRequester: requester,
        featurableEntityType: 'organization',
        organizationModel: organizationModel,
        featureKey: params.featureKey,
        overrideFeatureValue: params.featureValue,
        packageModel: packageModel
      })
    }
    throw new BadRequestException({
      message: 'Feature override creation is not supported in this context. Please use the appropriate service or method to create feature overrides.',
      data: {
        organization_id: params.organizationId,
        featurable_entity_type: params.featurableEntityType,
        featurable_entity_id: params.featurableEntityId,
        feature_key: params.featureKey,
        feature_value: params.featureValue,
        package_id: params.packageId
      }
    })
  }

}
