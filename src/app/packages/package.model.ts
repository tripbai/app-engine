import { BaseEntity } from "../../core/orm/entity/base-entity";
import {
  boolean,
  collection,
  length,
  varchar,
} from "../../core/orm/entity/entity-decorators";
import { assertIsPackageName } from "./package.assertions";

@collection("packages")
export class PackageModel extends BaseEntity {
  @length(32)
  @varchar(assertIsPackageName)
  name!: string;

  @boolean()
  is_active!: boolean;

  /**
   * Default packages are given to newly created organizations.
   * This contains all the basic features. Organizations need
   * to be upgraded if different package is required.
   */
  @boolean()
  is_default!: boolean;
}
