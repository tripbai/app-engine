import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import * as Core from "../../../core/module/types";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { ScheduleGetService } from "../services/schedule-get.service";
import { ScheduleRepository } from "../schedule.repository";

@injectable()
export class GetTourScheduleQuery {
  constructor(
    @inject(OrganizationRequesterFactory)
    private organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory)
    private unitOfWorkFactory: UnitOfWorkFactory,
    @inject(ScheduleRepository)
    private scheduleRepository: ScheduleRepository,
    @inject(ScheduleGetService)
    private scheduleGetService: ScheduleGetService,
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
        query_name: "GetTourScheduleQuery",
      },
    });
  }
}
