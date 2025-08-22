import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { ImageModel } from "./image.model";

export class ImageCreatedEvent implements EventInterface {
  id() {return '2e759baf-f417-4d08-ace7-06996325df59';}
  async handler(imageModel: ImageModel){}
}

export class ImageUpdatedEvent implements EventInterface {
  id() {return 'a925b6b9-6086-4c71-b1d6-b03a5f25fc6f';}
  async handler(imageModel: ImageModel){}
}

export class ImageDeletedEvent implements EventInterface {
  id() {return 'b2818566-d113-45db-974c-4eadb9bdeba8';}
  async handler(imageModel: ImageModel){}
}

