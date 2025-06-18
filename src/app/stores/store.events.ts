import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { StoreModel } from "./store.model";

export class StoreCreatedEvent implements EventInterface {
  id() {return '2c7d184d-4577-40a1-9634-120809e556bb';}
  async handler(storeModel: StoreModel){}
}

export class StoreUpdatedEvent implements EventInterface {
  id() {return 'b669fd6b-13fe-42ef-ba46-01a547fd1490';}
  async handler(storeModel: StoreModel){}
}

export class StoreDeletedEvent implements EventInterface {
  id() {return '8b76a029-ba37-4c7b-8647-64d2fdc8fbc6';}
  async handler(storeModel: StoreModel){}
}

