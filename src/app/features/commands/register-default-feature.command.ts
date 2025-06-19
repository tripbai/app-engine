import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { FeatureCreateService } from "../services/feature-create.service";
import { FeaturesList } from "../features.list";
import { PackageRepository } from "../../packages/package.repository";


@injectable()
export class RegisterDefaultFeatureCommand {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(AbstractEventManagerProvider) public readonly abstractEventManagerProvider: AbstractEventManagerProvider,
    @inject(FeatureCreateService) public readonly featureCreateService: FeatureCreateService,
    @inject(PackageRepository) public readonly packageRepository: PackageRepository
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester,
    featureKey: keyof FeaturesList,
    featureValue: string,
    packageId: Core.Entity.Id
  }) {
    const requester = this.organizationRequesterFactory.create(params.requester)
    const packageModel = await this.packageRepository.getById(params.packageId)
    return await this.featureCreateService.registerDefaultFeatureInPackage({
      featureKey: params.featureKey,
      featureValue: params.featureValue,
      organizationRequester: requester,
      packageModel: packageModel
    }) 
  }

}
