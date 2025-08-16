import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { StoreCreateService } from "../services/store-create.service";
import { StoreRepository } from "../store.repository";
import { OrganizationRepository } from "../../organizations/organization.repository";
import { StoreCreatedEvent } from "../store.events";

@injectable()
export class CreateStoreCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(StoreRepository) private storeRepository: StoreRepository,
    @inject(StoreCreateService)
    private storeCreateService: StoreCreateService,
    @inject(AbstractEventManagerProvider)
    private abstractEventManagerProvider: AbstractEventManagerProvider,
    @inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository
  ) {}

  async execute(params: {
    requester: Core.Authorization.Requester;
    organizationId: Core.Entity.Id;
    name: string;
  }) {
    const unitOfWork = this.unitOfWorkFactory.create();
    const requester = this.organizationRequesterFactory.create(
      params.requester
    );
    const organizationModel = await this.organizationRepository.getById(
      params.organizationId
    );
    const storeModel = await this.storeCreateService.createStore({
      requester: requester,
      organizationModel: organizationModel,
      name: params.name,
      unitOfWork: unitOfWork,
    });
    await unitOfWork.commit();
    this.abstractEventManagerProvider.dispatch(
      new StoreCreatedEvent(),
      storeModel
    );
    return storeModel;
  }
}
