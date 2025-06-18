import { inject, injectable } from "inversify";
import { ScheduleRepository } from "../schedule.repository";

@injectable()
export class ScheduleGetService {

  constructor(
    @inject(ScheduleRepository) public readonly scheduleRepository: ScheduleRepository
  ) {}

}