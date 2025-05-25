import { AssertEntity } from "../entity/assertions"
import { BaseEntity } from "../entity/entity"
import { BadRequestException, DataIntegrityException, LogicException, RecordNotFoundException } from "../../exceptions/exceptions"
import { TimeStamp } from "../../helpers/timestamp"
import { Entity } from "../../interface"
import { RepositoryHelper } from "./helpers"
import { RepositoryServiceProviders } from "./types"
import { EntityToolkit } from "../entity/toolkit"

/**
 * A registry is an abstract structure or collection of related data 
 * entities that are grouped together based on a shared foreign key 
 * or common attribute. It acts as a conceptual grouping of data, 
 * abstracting away the details of how it's stored or retrieved 
 * (whether from a relational table or a non-relational document).
 * 
 * In a relational database, the registry represents rows linked 
 * by the same foreign key value. In non-relational databases, 
 * it represents a collection of objects tied by a common field 
 * and value.
 * 
 * The registry provides a unified interface to work with related 
 * data entities, regardless of the underlying database type, 
 * simplifying operations like fetching or managing associated data.
 */
export class RegistryRepository<TModel extends BaseEntity<TModel>> {

  /**
   * In NoSQL databases, the collection refers to the database collection itself. 
   * For relational databases, this collection value refers
   * to the name of the database table
   */
  protected readonly collection: string

  /**
   * Binds service providers to a Registry instance
   */
  protected readonly providers: RepositoryServiceProviders

  /**
   * Refers to the entity_id of the foriegn key
   */
  protected foreignKeyEntityId: Entity.Id

  /**
   * The name of the foreign key field that relates the 
   * records together
   */
  protected reference: string

  /**
   * An array of the TModel
   */
  protected readonly model: TModel

  /**
   * Indicates whether the TModels have already initialized.
   * Please know that this will set as true even if the
   * query that retrieves the data returns empty.
   */
  protected hasFetchedOnce: boolean

  /**
   * The TModel itself
   */
  protected readonly models: Array<Readonly<TModel>>

  
  constructor(foreignKeyEntityId: Entity.Id){
    this.foreignKeyEntityId = foreignKeyEntityId
    this.hasFetchedOnce = false
    this.models = []
  }


  /**
   * Connection has to be made to external service providers before they 
   * can be used. This method allows the RegistryController to connect to the
   * declared service providers
   */
  protected async connectProviders(): Promise<boolean>{
    for (const key in this.providers) {
      const provider = this.providers[key]
      if (
        provider !== null && 
        'connect' in this.providers[key]
      ) {
        await this.providers[key].connect()
      }
    }
    return true
  }

  /**
   * Retieves data from the Database provider, and 
   * initializes the model. 
   * 
   * @throws BadRegistryDataException
   */
  private async initializeData(): Promise<void>{
    /** Simply returns if data has been fetched previously */
    if (this.hasFetchedOnce) {
      return 
    }
    /** Initiates a connection to the providers */
    await this.connectProviders()
    /** Retrieves data from the database */
    const results 
      = await this.providers.database
          .whereField(this.collection, this.reference)
          .hasValue(this.foreignKeyEntityId)
    this.hasFetchedOnce = true
    if (results.length === 0) {
      return
    }
    for (let i = 0; i < results.length; i++) {
      const data = results[i]
      if (!(this.reference in data)) {
        throw new LogicException({
          message: 'foreign reference key missing in data',
          data: {
            foreign_key: this.foreignKeyEntityId,
            reference_key: this.reference,
            collection: this.collection
          }
        })
      } 
      const Registry: TModel = Object.create(this.model)
      try {
        for (const key in data) {
          if (RepositoryHelper.isDateObject(data[key])) {
            // the above check will determine if the value is Date object
            Registry[key] = TimeStamp.normalize(data[key])
          } else {
            Registry[key] = data[key]
          }
        }
      } catch (error) {
        throw new DataIntegrityException({
          message: 'database record contains invalid data',
          data: {
            foreign_key: this.foreignKeyEntityId,
            reference_key: this.reference,
            collection: this.collection,
            error: error
          }
        })
      }
      this.models.push(Registry)
    }
  }

  /**
   * Creates a new record in the Registry
   * @param data 
   * @returns 
   */
  async create(
    data: Omit<{[K in keyof TModel]: unknown}, Exclude<Entity.ReservedFields, 'entity_id'>>
  ): Promise<void> {
    await this.initializeData()
    const Registry: TModel = Object.create(this.model)
    try {
      for (const key in data) {
        Registry[key] = data[key]
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'create data contains one or more invalid fields',
        data: {
          foreign_key: this.foreignKeyEntityId,
          reference_key: this.reference,
          collection: this.collection,
          data: data
        }
      })
    }
    Registry.created_at = TimeStamp.now()
    Registry.updated_at = TimeStamp.now()
    Registry.archived_at = null
    const singleOp = this.providers.database.create().entity(
      this.collection,
      RepositoryHelper.toDatabaseRecordDTO(
        EntityToolkit.serialize(Registry)
      )
    )
    this.models.push(Registry)
    await this.providers.database.beginTransaction([singleOp])
  }

  /**
   * Retrieves a record from the Registry
   * @param entityId 
   * @returns 
   */
  async get(entityId: Entity.Id): Promise<Readonly<Record<keyof TModel, TModel[keyof TModel]>>>{
    await this.initializeData()
    const filtered = this.models.filter(model=>{
      return model.entity_id === entityId
    })
    if (filtered.length === 0) {
      throw new RecordNotFoundException({
        message: 'record not found from database',
        data: {entity_id: entityId, collection: this.collection}
      })
    }
    return EntityToolkit.serialize(filtered[0])
  }

  /**
   * Updates a record in the Registry
   * @param UpdatedModel 
   * @returns 
   */
  async update(data: Partial<Omit<{[K in keyof TModel]: unknown}, Exclude<Entity.ReservedFields, 'entity_id'>>>): Promise<void> {
    try {
      AssertEntity.idIsValid(data.entity_id)
    } catch (error) {
      throw new LogicException({
        message: 'invalid entity_id value',
        data: {
          entity_id: data.entity_id,
          error: error
        }
      })
    }
    const ExistingModel = await this.get(data.entity_id)
    let UpdatedModel: TModel = Object.create(this.model)
    for (const key in ExistingModel) {
      const keyd: keyof TModel = key
      UpdatedModel[keyd] = ExistingModel[key]
    }
    try {
      /** Overrides with the updated value */
      for (const key in data) {
        UpdatedModel[key] = data[key]
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'update data contains one or more invalid fields',
        data: {
          data: data,
          error: error
        }
      })
    }
    UpdatedModel.updated_at = TimeStamp.now()
    const singleOp = this.providers.database.update().entity(
      this.collection,
      RepositoryHelper.toDatabaseRecordDTO(
        EntityToolkit.serialize(UpdatedModel)
      )
    )
    await this.providers.database.beginTransaction([singleOp])
  }

  /**
   * Retrieves all records in the Registry
   * @returns 
   */
  async getAll(): Promise<Array<Readonly<Record<keyof TModel, TModel[keyof TModel]>>>>{
    await this.initializeData()
    return this.models.map(model => EntityToolkit.serialize(model))
  }

  async archive(entityId: Entity.Id): Promise<void> {
    const ExistingModel = await this.get(entityId)
    let UpdatedModel: TModel = Object.create(this.model)
    //let UpdatedModel: TModel = Object.create(this.model)
    for (const key in ExistingModel) {
      const keyd: keyof TModel = key
      UpdatedModel[keyd] = ExistingModel[key]
    }
    UpdatedModel.archived_at = TimeStamp.now()
    UpdatedModel.updated_at = TimeStamp.now()
    const singleOp = this.providers.database.update().entity(
      this.collection,
      RepositoryHelper.toDatabaseRecordDTO(
        EntityToolkit.serialize(UpdatedModel)
      )
    )
    await this.providers.database.beginTransaction([singleOp])
  }

  async reactivate(entityId: Entity.Id): Promise<void> {
    const ExistingModel = await this.get(entityId)
    let UpdatedModel: TModel = Object.create(this.model)
    for (const key in ExistingModel) {
      const keyd: keyof TModel = key
      UpdatedModel[keyd] = ExistingModel[key]
    }
    UpdatedModel.archived_at = null
    UpdatedModel.updated_at = TimeStamp.now()
    const singleOp = this.providers.database.update().entity(
      this.collection,
      RepositoryHelper.toDatabaseRecordDTO(
        EntityToolkit.serialize(UpdatedModel)
      )
    )
    await this.providers.database.beginTransaction([singleOp])
  }

}
