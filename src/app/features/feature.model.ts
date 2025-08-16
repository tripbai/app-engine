import * as Core from "../../core/module/types";
import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  EntityId,
  boolean,
  collection,
  nullable,
  references,
  varchar,
  length,
} from "../../core/orm/entity/entity-decorators";
import { PackageModel } from "../packages/package.model";
import {
  assertIsFeatureCategory,
  assertIsFeatureKey,
} from "./feature.assertions";
import { FeaturesList } from "./features.list";

export class FeatureModel extends BaseEntity {
  @length(32)
  @varchar(assertIsFeatureKey)
  key!: keyof FeaturesList;

  @length(64)
  @varchar()
  value!: string;

  @length(64)
  @varchar(assertIsFeatureCategory)
  category!: string;

  @references(PackageModel, "entity_id")
  @EntityId()
  package_id!: Core.Entity.Id;

  @length(256)
  @nullable()
  @varchar()
  description!: string | null;

  /**
   * The organization_id, if the feature is organization-level
   * or store_id, if the feature is store-specific.
   */
  @nullable()
  @EntityId()
  featurable_entity_id!: Core.Entity.Id | null;

  /**
   * Tells whether organization is able
   * to update this feature
   */
  @boolean()
  org_mutable!: boolean;
}
