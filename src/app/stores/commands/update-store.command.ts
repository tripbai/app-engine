import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { StoreUpdateService } from "../services/store-update.service";
import { StoreRepository } from "../store.repository";

@injectable()
export class UpdateStoreCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(StoreRepository) private storeRepository: StoreRepository,
    @inject(StoreUpdateService)
    private storeUpdateService: StoreUpdateService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider
  ) {}

  async execute(params: { requester: Core.Authorization.Requester }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    throw new LogicException({
      message: "This command is not implemented yet",
      data: {
        command_name: "UpdateStoreCommand",
      },
    });
  }
}
