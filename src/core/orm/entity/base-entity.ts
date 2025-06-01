import { DataIntegrityException } from "../../exceptions/exceptions"
import { TimeStamp } from "../../helpers/timestamp"
import { Core } from "../../module/module"
import { EntityToolkit } from "./entity-toolkit"

/**
 * Base object of all Entity Objects
 */
export class BaseEntity<TModel> {

  /** This is an optional field only */
  id?: Core.Entity.ExternalId

  /**
   * The Entity ID of an object. This value can only be provided once, 
   * and cannot be overriden. This property only accepts value typeof string, 
   * with characters not lesser than 1 and not more than 32.
   */
  set entity_id (value: Core.Entity.Id){
    EntityToolkit.Assert.idIsValid(value)
    const alias = EntityToolkit.PropAlias.create('entity_id')
    if (undefined === this[alias]) this[alias] = value
  }
  get entity_id (): Core.Entity.Id {
    const alias = EntityToolkit.PropAlias.create('entity_id')
    return this[alias]
  }

  /**
   * The date as to when the object has been created. This value should be automatically
   * provided by the Storage Provider, and cannot be overridden.
   */
  set created_at (value: string) {
    const alias = EntityToolkit.PropAlias.create('created_at')
    if (!TimeStamp.isValid(value)){
      throw new DataIntegrityException({
        message: 'entity created_at value is not valid timestamp string',
        data: {entity_id: this.entity_id, value: value}
      })
    }
    if (undefined === this[alias]) 
      this[alias] = value
  }
  get created_at(): string {
    const alias = EntityToolkit.PropAlias.create('created_at')
    return this[alias]
  }

  /**
   * The date as to when the object has been updated. This value should be automatically
   * provided and updated by the Storage Provider.
   */
  set updated_at (value: string) {
    const alias = EntityToolkit.PropAlias.create('updated_at')
    if (!TimeStamp.isValid(value)){
      throw new DataIntegrityException({
        message: 'updated_at value is not valid timestamp string',
        data: {entity_id: this.entity_id, value: value}
      })
    }
    this[alias] = value
  }
  get updated_at(): string {
    const alias = EntityToolkit.PropAlias.create('updated_at')
    return this[alias]
  }


  /**
   * The date as to when the object has been archived. This value can be used 
   * when cleaning up unused soft-deleted records.
   */
  set archived_at (value: string | null) {
    const alias = EntityToolkit.PropAlias.create('archived_at')
    if (value !== null && !TimeStamp.isValid(value)) {
      throw new DataIntegrityException({
        message: 'archived_at value is not valid timestamp string',
        data: {entity_id: this.entity_id, value: value}
      })
    }
    this[alias] = value
  }
  get archived_at(): string | null {
    const alias = EntityToolkit.PropAlias.create('archived_at')
    return this[alias]
  }

}

