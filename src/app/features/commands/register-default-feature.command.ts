import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { FeatureCreateService } from "../services/feature-create.service";
import { FeaturesList } from "../features.list";
import { PackageRepository } from "../../packages/package.repository";

@injectable()
export class RegisterDefaultFeatureCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider,
    @inject(FeatureCreateService)
    private featureCreateService: FeatureCreateService,
    @inject(PackageRepository)
    private packageRepository: PackageRepository
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    featureKey: keyof FeaturesList;
    featureValue: string;
    packageId: Core.Entity.Id;
  }) {
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    const packageModel = await this.packageRepository.getById(params.packageId);
    return await this.featureCreateService.registerDefaultFeatureInPackage({
      featureKey: params.featureKey,
      featureValue: params.featureValue,
      organizationRequester: requester,
      packageModel: packageModel,
    });
  }
}
