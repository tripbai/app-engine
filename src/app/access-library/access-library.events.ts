import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { Access-libraryModel } from "./access-library.model";

export class Access-libraryCreatedEvent implements EventInterface {
  id() {return '353e40b9-f532-4ae4-8307-0f1c468e2f00';}
  async handler(access-libraryModel: Access-libraryModel){}
}

export class Access-libraryUpdatedEvent implements EventInterface {
  id() {return 'f5cd84f0-0c83-4234-97fd-efacbb800d20';}
  async handler(access-libraryModel: Access-libraryModel){}
}

export class Access-libraryDeletedEvent implements EventInterface {
  id() {return '9d8ee3c7-5fe5-4614-9954-54036516162a';}
  async handler(access-libraryModel: Access-libraryModel){}
}

