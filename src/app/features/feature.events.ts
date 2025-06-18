import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { FeatureModel } from "./feature.model";

export class FeatureCreatedEvent implements EventInterface {
  id() {return 'a9a12355-e9ce-4ba9-b746-2f011db76525';}
  async handler(featureModel: FeatureModel){}
}

export class FeatureUpdatedEvent implements EventInterface {
  id() {return '4aad0b20-2a8b-472f-b488-f5cdc5d4a624';}
  async handler(featureModel: FeatureModel){}
}

export class FeatureDeletedEvent implements EventInterface {
  id() {return 'edcaa997-d7b1-4d4a-805a-ccad2967d47a';}
  async handler(featureModel: FeatureModel){}
}

