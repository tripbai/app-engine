import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { TourModel } from "./tour.model";

export class TourCreatedEvent implements EventInterface {
  id() {return 'cd2efb32-d1ad-474c-9a8c-db4053585aaf';}
  async handler(tourModel: TourModel){}
}

export class TourUpdatedEvent implements EventInterface {
  id() {return '57787834-fe82-487f-a031-f94c3c0aa9e0';}
  async handler(tourModel: TourModel){}
}

export class TourDeletedEvent implements EventInterface {
  id() {return 'fa52f958-b132-4e0c-8131-abb3eb2e467c';}
  async handler(tourModel: TourModel){}
}

