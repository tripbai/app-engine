import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { OrganizationRepository } from "../organization.repository";
import { OrganizationAuthService } from "../services/organization-auth.service";

@injectable()
export class GenerateAuthTokenCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider,
    @inject(OrganizationAuthService)
    private organizationAuthService: OrganizationAuthService
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    iAuthCertificationToken: string;
  }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    const token =
      await this.organizationAuthService.exchangeIAuthTokenToOrganizationToken({
        organizationRequester: requester,
        iAuthCertificationToken: params.iAuthCertificationToken,
      });
    return token;
  }
}
