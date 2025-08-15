import { inject, injectable } from "inversify";
import { ScheduleRepository } from "../schedule.repository";

@injectable()
export class ScheduleCreateService {
  constructor(
    @inject(ScheduleRepository) private scheduleRepository: ScheduleRepository
  ) {}
}
