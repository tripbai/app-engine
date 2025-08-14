import { DataIntegrityException } from "../../exceptions/exceptions";
import * as Core from "../../module/types";
import {
  assertValidEntityId,
  createPropAlias,
} from "../../utilities/entityToolkit";
import { isValidTimestamp } from "../../utilities/timestamp";

export class BaseEntity {
  /**
   * An optional field for non-uuid identifiers
   */
  id?: Core.Entity.Id;

  private _entity_id!: Core.Entity.Id;
  private _created_at!: string;
  private _updated_at!: string;
  private _archived_at: string | null = null;

  /**
   * The Entity ID of an object. This value can only be provided once,
   * and cannot be overriden. This property only accepts value typeof string,
   * with characters not lesser than 1 and not more than 32.
   */
  set entity_id(value: Core.Entity.Id) {
    assertValidEntityId(value);
    const alias = createPropAlias("entity_id");
    if (undefined === this[alias]) this[alias] = value;
  }
  get entity_id(): Core.Entity.Id {
    const alias = createPropAlias("entity_id");
    return this[alias];
  }

  /**
   * The date as to when the object has been created. This value should be automatically
   * provided by the Storage Provider, and cannot be overridden.
   */
  set created_at(value: Core.TimeStamp) {
    const alias = createPropAlias("created_at");
    if (!isValidTimestamp(value)) {
      throw new DataIntegrityException({
        message: "entity created_at value is not valid timestamp string",
        data: { entity_id: this.entity_id, value: value },
      });
    }
    if (undefined === this[alias]) this[alias] = value;
  }
  get created_at(): Core.TimeStamp {
    const alias = createPropAlias("created_at");
    return this[alias] as Core.TimeStamp;
  }

  /**
   * The date as to when the object has been updated. This value should be automatically
   * provided and updated by the Storage Provider.
   */
  set updated_at(value: string) {
    const alias = createPropAlias("updated_at");
    if (!isValidTimestamp(value)) {
      throw new DataIntegrityException({
        message: "updated_at value is not valid timestamp string",
        data: { entity_id: this.entity_id, value: value },
      });
    }
    this[alias] = value;
  }
  get updated_at(): Core.TimeStamp {
    const alias = createPropAlias("updated_at");
    return this[alias] as Core.TimeStamp;
  }

  /**
   * The date as to when the object has been archived. This value can be used
   * when cleaning up unused soft-deleted records.
   */
  set archived_at(value: Core.TimeStamp | null) {
    const alias = createPropAlias("archived_at");
    if (value !== null && !isValidTimestamp(value)) {
      throw new DataIntegrityException({
        message: "archived_at value is not valid timestamp string",
        data: { entity_id: this.entity_id, value: value },
      });
    }
    this[alias] = value;
  }
  get archived_at(): Core.TimeStamp | null {
    const alias = createPropAlias("archived_at");
    return this[alias] as Core.TimeStamp | null;
  }
}
