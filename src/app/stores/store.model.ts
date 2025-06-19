import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { TripBai } from "../module/module.interface";

export class StoreModel extends BaseEntity<StoreModel> {

  organization_id: Core.Entity.Id

  status: TripBai.Stores.Fields.Status

}