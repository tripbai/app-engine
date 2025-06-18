import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { AccessLibraryModel } from "./access-library.model";

export class AccessLibraryCreatedEvent implements EventInterface {
  id() {return '353e40b9-f532-4ae4-8307-0f1c468e2f00';}
  async handler(AccessLibraryModel: AccessLibraryModel){}
}

export class AccessLibraryUpdatedEvent implements EventInterface {
  id() {return 'f5cd84f0-0c83-4234-97fd-efacbb800d20';}
  async handler(AccessLibraryModel: AccessLibraryModel){}
}

export class AccessLibraryDeletedEvent implements EventInterface {
  id() {return '9d8ee3c7-5fe5-4614-9954-54036516162a';}
  async handler(AccessLibraryModel: AccessLibraryModel){}
}

