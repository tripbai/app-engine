import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { TourDeleteService } from "../services/tour-delete.service";
import { TourRepository } from "../tour.repository";

@injectable()
export class DeleteTourCommand {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(TourRepository) private tourRepository: TourRepository,
    @inject(TourDeleteService)
    private tourDeleteService: TourDeleteService,
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
        command_name: "DeleteTourCommand",
      },
    });
  }
}
