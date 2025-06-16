import { BaseEntity } from "../entity/base-entity"
import { BadRequestException, DataIntegrityException, LogicException, RecordNotFoundException } from "../../exceptions/exceptions"
import { TimeStamp } from "../../helpers/timestamp"
import { Core } from "../../module/module"
import { RepositoryServiceProviders, WithReservedFields } from "./types"
import { EntityToolkit } from "../entity/entity-toolkit"
import { inject } from "inversify"
import { AbstractCacheProvider } from "../../providers/cache/cache.provider"
import { AbstractDatabaseProvider } from "../../providers/database/database.provider"

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
    * The name of the foreign key field that relates the 
    * records together
    */
   protected readonly reference: string

   /** The model instance */
   protected readonly modelInstance: TModel

  /**
   * Binds service providers to a Registry instance
   */
  protected readonly providers: Omit<RepositoryServiceProviders,'cache'>

  constructor(params: {
    collection: string,
    reference: string,
    modelInstance: TModel,
    databaseProvider: AbstractDatabaseProvider
  }){
    this.collection = params.collection
    this.reference = params.reference
    this.modelInstance = params.modelInstance
    this.providers = {
      database: params.databaseProvider
    }
  }


  /**
   * Connection has to be made to external service providers before they 
   * can be used. This method allows the RegistryController to connect to the
   * declared service providers
   */
  protected async connectProviders(): Promise<boolean>{
    this.providers.database.connect()
    return true
  }

  /**
   * Retieves data from the Database provider, and 
   * initializes the model. 
   * 
   * @throws LogicException
   * @throws DataIntegrityException
   */
  private async retrieveData(
    foreignKeyEntityId: Core.Entity.Id
  ): Promise<Array<TModel>>{
    const models: Array<TModel> = []
    /** Initiates a connection to the providers */
    await this.connectProviders()
    /** Retrieves data from the database */
    const results 
      = await this.providers.database
          .whereFieldHasValue(this.collection, this.reference, foreignKeyEntityId)
    if (results.length === 0) {
      return models
    }
    for (let i = 0; i < results.length; i++) {
      const data = results[i]
      if (!(this.reference in data)) {
        throw new LogicException({
          message: 'foreign reference key missing in data',
          data: {
            foreign_key: foreignKeyEntityId,
            reference_key: this.reference,
            collection: this.collection
          }
        })
      }

      const Registry: TModel = Object.create(this.modelInstance)
      try {
        for (const key in data) {
          if (RegistryRepository.isDateObject(data[key])) {
            // @ts-expect-error the above check will determine if the value is Date object
            Registry[key] = TimeStamp.normalize(data[key])
          } else {
            Registry[key] = data[key]
          }
        }
      } catch (error) {
        throw new DataIntegrityException({
          message: 'one of registry records contains invalid data',
          data: {
            foreign_key: foreignKeyEntityId,
            reference_key: this.reference,
            collection: this.collection,
            error: error
          }
        })
      }
      models.push(Registry)
    }
    return models
  }

  /**
   * Retrieves a record from the Registry
   * @param entityId 
   * @returns 
   */
  async get(params: {
    foreignKeyValue: Core.Entity.Id,
    entityId: Core.Entity.Id
  }): Promise<WithReservedFields<TModel, 'entity_id' | 'created_at' | 'updated_at'>>{
    const models = await this.retrieveData(params.foreignKeyValue)
    const filtered = models.filter(model=>{
      return model.entity_id === params.entityId
    })
    if (filtered.length === 0) {
      throw new RecordNotFoundException({
        message: 'record not found from registry',
        data: {entity_id: params.entityId, collection: this.collection}
      })
    }
    return EntityToolkit.serialize(filtered[0])
  }

  /**
   * Retrieves all records in the Registry
   * @returns 
   */
  async getAll(params: {
    foreignKeyValue: Core.Entity.Id
  }): Promise<Array<WithReservedFields<TModel, 'entity_id' | 'created_at' | 'updated_at'>>>{
    const models = await this.retrieveData(params.foreignKeyValue)
    return models.map(model => EntityToolkit.serialize(model))
  }

  private static isDateObject(value: unknown) {
    if (typeof value !== 'object') return false
    return value instanceof Date
  }

}
