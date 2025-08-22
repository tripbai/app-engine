import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import {
  LogicException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { OrganizationCreateService } from "../services/organization-create.service";
import { OrganizationRepository } from "../organization.repository";
import { PackageRepository } from "../../packages/package.repository";
import { OrganizationCreatedEvent } from "../organization.events";
import * as TripBai from "../../module/types";

@injectable()
export class CreateOrganizationCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
    @inject(OrganizationCreateService)
    private organizationCreateService: OrganizationCreateService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider,
    @inject(PackageRepository)
    private packageRepository: PackageRepository
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    accessCertificationToken: string;
    businessName: string;
    packageId: Core.Entity.Id;
    organizationType: TripBai.Organizations.Fields.Type;
  }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    if (!requester.hasAllowedAccess()) {
      throw new ResourceAccessForbiddenException({
        message: "Requester does not have access to create an organization",
        data: { requester },
      });
    }
    const packageModel = await this.packageRepository.getById(params.packageId);
    const organizationModel =
      await this.organizationCreateService.createOrganizationIfNotExist({
        unitOfWork: unitOfWork,
        requester: requester,
        businessName: params.businessName,
        accessCertificationToken: params.accessCertificationToken,
        packageModel: packageModel,
        organizationType: params.organizationType,
      });
    await unitOfWork.commit();
    this.abstractEventManagerProvider.dispatch(
      new OrganizationCreatedEvent(),
      organizationModel
    );
    return organizationModel;
  }
}
