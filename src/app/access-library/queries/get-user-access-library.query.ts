import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { AccessLibraryGetService } from "../services/access-library-get.service";
import { AccessLibraryRepository } from "../access-library.repository";

@injectable()
export class GetUserAccessLibraryQuery {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(AccessLibraryRepository) public readonly AccessLibraryRepository: AccessLibraryRepository,
    @inject(AccessLibraryGetService) public readonly AccessLibraryGetService: AccessLibraryGetService,
    @inject(AbstractEventManagerProvider) public readonly abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester
  }) {
    const unitOfWork = this.unitOfWorkFactory.create()
    const requester = this.organizationRequesterFactory.create(params.requester)
    throw new LogicException({
      message: 'This query is not implemented yet',
      data: {
        query_name: 'GetUserAccessLibraryQuery'
      }
    })
  }

}
