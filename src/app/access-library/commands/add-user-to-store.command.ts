import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { AccessLibraryRepository } from "../access-library.repository";

@injectable()
export class AddUserToStoreCommand {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(AccessLibraryRepository) public readonly AccessLibraryRepository: AccessLibraryRepository,
    @inject(AbstractEventManagerProvider) public readonly abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester
  }) {
    const unitOfWork = this.unitOfWorkFactory.create()
    const requester = this.organizationRequesterFactory.create(params.requester)
    throw new LogicException({
      message: 'This command is not implemented yet',
      data: {
        command_name: 'AddUserToStoreCommand'
      }
    })
  }

}
