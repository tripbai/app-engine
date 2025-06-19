import { Core } from "../../core/module/module";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import { EntityId, boolean, collection, nullable, references, varchar, length } from "../../core/orm/entity/decorators";
import { PackageModel } from "../packages/package.model";
import { FeatureValidator } from "./feature.validator";
import { FeaturesList } from "./features.list";

export class FeatureModel extends BaseEntity<FeatureModel> {

  @length(32)
  @varchar(FeatureValidator.key)
  key: keyof FeaturesList

  @length(64)
  @varchar()
  value: string

  @length(64)
  @varchar(FeatureValidator.category)
  category: string

  @references(PackageModel, 'entity_id')
  @EntityId()
  package_id: Core.Entity.Id

  @length(256)
  @nullable()
  @varchar()
  description: string | null

  /** 
   * The organization_id, if the feature is organization-level
   * or store_id, if the feature is store-specific.
   */
  @nullable()
  @EntityId()
  featurable_entity_id: Core.Entity.Id | null

  /** 
   * Tells whether organization is able
   * to update this feature
   */
  @boolean()
  org_mutable: boolean

}