import { inject, injectable } from "inversify";
import { ScheduleRepository } from "../schedule.repository";

@injectable()
export class ScheduleUpdateService {
  constructor(
    @inject(ScheduleRepository) private scheduleRepository: ScheduleRepository
  ) {}
}
