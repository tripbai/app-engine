import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { StoreCreateService } from "../services/store-create.service";
import { StoreRepository } from "../store.repository";

@injectable()
export class CreateStoreCommand {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(StoreRepository) public readonly storeRepository: StoreRepository,
    @inject(StoreCreateService) public readonly storeCreateService: StoreCreateService,
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
        command_name: 'CreateStoreCommand'
      }
    })
  }

}
