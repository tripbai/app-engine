import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { PackageModel } from "./package.model";

export class PackageCreatedEvent implements EventInterface {
  id() {return '7d18846f-6b86-48fe-919d-8f858fff1741';}
  async handler(packageModel: PackageModel){}
}

export class PackageUpdatedEvent implements EventInterface {
  id() {return 'ce5a1711-b337-4ffe-a47d-d936296cdec0';}
  async handler(packageModel: PackageModel){}
}

export class PackageDeletedEvent implements EventInterface {
  id() {return '8d5b6941-9522-4f71-86f6-6d5d0895aba6';}
  async handler(packageModel: PackageModel){}
}

