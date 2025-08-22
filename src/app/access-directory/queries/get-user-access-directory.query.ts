import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { AccessDirectoryGetService } from "../services/access-directory-get.service";
import { AccessDirectoryRepository } from "../access-directory.repository";

@injectable()
export class GetUserAccessDirectoryQuery {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(AccessDirectoryRepository)
    private accessDirectoryRepository: AccessDirectoryRepository,
    @inject(AccessDirectoryGetService)
    private accessLibraryGetService: AccessDirectoryGetService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: { requester: Core.Authorization.Requester }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    throw new LogicException({
      message: "This query is not implemented yet",
      data: {
        query_name: "GetUserAccessLibraryQuery",
      },
    });
  }
}
