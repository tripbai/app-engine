import { inject, injectable } from "inversify";
import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
import { Core } from "../../../core/module/module";
import { LogicException } from "../../../core/exceptions/exceptions";
import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
import { ScheduleGetService } from "../services/schedule-get.service";
import { ScheduleRepository } from "../schedule.repository";

@injectable()
export class GetToursScheduleQuery {

  constructor(
    @inject(OrganizationRequesterFactory) public readonly organizationRequesterFactory: OrganizationRequesterFactory,
    @inject(UnitOfWorkFactory) public readonly unitOfWorkFactory: UnitOfWorkFactory,
    @inject(ScheduleRepository) public readonly scheduleRepository: ScheduleRepository,
    @inject(ScheduleGetService) public readonly scheduleGetService: ScheduleGetService,
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
        query_name: 'GetToursScheduleQuery'
      }
    })
  }

}
