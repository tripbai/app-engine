import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { OrganizationUpdateService } from "../services/organization-update.service";
import { OrganizationRepository } from "../organization.repository";
import { PackageRepository } from "../../packages/package.repository";
import { TripBai } from "../../module/module.interface";
import { OrganizationUpdatedEvent } from "../organization.events";

@injectable()
export class UpdateOrganizationCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
    @inject(OrganizationUpdateService)
    private organizationUpdateService: OrganizationUpdateService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider,
    @inject(PackageRepository)
    private packageRepository: PackageRepository
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    organizationId: Core.Entity.Id;
    packageId?: Core.Entity.Id;
    businessName?: string;
    status?: TripBai.Organizations.Fields.Status;
  }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    const organizationModel = await this.organizationRepository.getById(
      params.organizationId
    );
    const serviceParams: Parameters<
      OrganizationUpdateService["updateOrganization"]
    >[0] = Object.create(null);
    serviceParams.organizationModel = organizationModel;
    serviceParams.organizationRequester = requester;
    if (params.packageId) {
      const packageModel = await this.packageRepository.getById(
        params.packageId
      );
      serviceParams.packageModel = packageModel;
    }
    if (params.businessName) {
      serviceParams.businessName = params.businessName;
    }
    if (params.status) {
      serviceParams.status = params.status;
    }
    this.organizationUpdateService.updateOrganization(serviceParams);
    unitOfWork.addTransactionStep(
      await this.organizationRepository.update(organizationModel)
    );
    await unitOfWork.commit();
    this.abstractEventManagerProvider.dispatch(
      new OrganizationUpdatedEvent(),
      organizationModel
    );
  }
}
