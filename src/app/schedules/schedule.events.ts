import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { ScheduleModel } from "./schedule.model";

export class ScheduleCreatedEvent implements EventInterface {
  id() {return '8c395b26-8556-4fd3-940a-281bd323e907';}
  async handler(scheduleModel: ScheduleModel){}
}

export class ScheduleUpdatedEvent implements EventInterface {
  id() {return '553d1332-bda4-4921-87e9-655ff57fc02e';}
  async handler(scheduleModel: ScheduleModel){}
}

export class ScheduleDeletedEvent implements EventInterface {
  id() {return 'fbf55310-2d01-495d-97a3-45c876e13c5f';}
  async handler(scheduleModel: ScheduleModel){}
}

