import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { OrganizationModel } from "./organization.model";

export class OrganizationCreatedEvent implements EventInterface {
  id() {return 'f6362dd3-2a81-4b2d-bd10-dd74722ec612';}
  async handler(organizationModel: OrganizationModel){}
}

export class OrganizationUpdatedEvent implements EventInterface {
  id() {return '013fe6d7-f95a-4356-a95c-dc8459765fb2';}
  async handler(organizationModel: OrganizationModel){}
}

export class OrganizationDeletedEvent implements EventInterface {
  id() {return '1d224367-7112-4f4d-9683-88ba091271e2';}
  async handler(organizationModel: OrganizationModel){}
}

