import { BaseEntity } from "../entity/base-entity";
import { ArchivedRecordException, BadRequestException, DataIntegrityException, LogicException, RecordNotFoundException } from "../../exceptions/exceptions";
import { thisJSON } from "../../helpers/thisjson";
import { TimeStamp } from "../../helpers/timestamp";
import { Core } from "../../core.types";
import { RepositoryGetOptions, RepositoryServiceProviders, WithReservedFields } from "./types";
import { EntityToolkit } from "../entity/entity-toolkit";
import { inject, injectable } from "inversify";
import { AbstractCacheProvider } from "../../providers/cache/cache.provider";
import { AbstractDatabaseProvider, DatabaseTransactionStep, FlatDatabaseRecord } from "../../providers/database/database.provider";
import { OverridingLockedActionException, OverridingReservedFieldsException, UpdatingUninitializedDataException } from "./exceptions";

export class BaseRepository<TModel extends BaseEntity<TModel>> {
  
  /**
   * In NoSQL databases, the collection refers to the database collection itself. 
   * On the other hand, on relational database, this collection value refers
   * to the name of the database table
   */
  protected readonly collection: string

  /**
   * The class definition of TModel itself
   */
  protected readonly model: new (...args: any[]) => TModel

  /**
   * Binds service providers to a Repository instance
   */
  protected readonly providers: RepositoryServiceProviders

  constructor(
    @inject(BaseEntity) Model: new (...args: any[]) => TModel,
    @inject(AbstractDatabaseProvider) DatabaseProvider: AbstractDatabaseProvider,
    @inject(AbstractCacheProvider) CacheProvider: AbstractCacheProvider
  ){
    this.model = Model
    this.providers = {
      database: DatabaseProvider,
      cache: CacheProvider
    }
  }

  /**
   * Connection has to be made to external service providers before they 
   * can be used. This method allows the Repository to connect to the
   * declared service providers
   */
  protected async initproviders(): Promise<boolean> {
    for (const key in this.providers) {
      const provider = this.providers[key]
      if (provider === null) continue
      if ('connect' in provider) {
        await provider.connect()
      }
    }
    return true
  }

  /**
   * Retrieves the model data by id with all its fields rendered as readonly. 
   * @returns The model object.
   */
  async getById(
    entityId: Core.Entity.Id, 
    options?: RepositoryGetOptions
  ): Promise<WithReservedFields<TModel, 'entity_id' | 'created_at' | 'updated_at'>>{
    await this.initproviders()

    /** If not, then, we'll attempt to retrieve data from cache */
    let cached: string | null = null
    if (this.providers.cache !== null) {
      cached = await this.providers.cache.getItem({
        collection: this.collection,
        entityId:   entityId
      })
    }

    /** Raw data retrieved from database or cache */
    let Data: any = null

    if (cached !== null) {
      if (!thisJSON.isParsable(cached)){
        throw new DataIntegrityException({
          message: `cached json data is not parsable`,
          data: {json: cached}
        })
      }
      Data = JSON.parse(cached)
    } else {
      /** If there is no cached data, then we will query the database */
      const results = await this.providers.database.getRecordById(
        this.collection,
        entityId
      )
      if (results.length === 0) {
        throw new RecordNotFoundException({
          message: 'record not found from database',
          data: {entity_id: entityId, collection: this.collection}
        })
      }
      if (results.length > 1) {
        throw new DataIntegrityException({
          message: `multiple records under the same entity_id and collection`,
          data: {entity_id: entityId, collection: this.collection}
        })
      }
      Data = results[0]
    }

    if (this.hasMissingReservedFields(Data)) {
      throw new DataIntegrityException({
        message: 'database record has missing required entity fields',
        data: {
          collection: this.collection,
          data: Data
        }
      })
    }

    const Model = new this.model()
    
    try {
      this.ingest(Model, Data)
    } catch (error) {
      throw new DataIntegrityException({
        message: 'database record contains invalid data',
        data: {
          collection: this.collection,
          data: Data,
          error: error
        }
      })
    }

    /** Saving data into cache */
    if (cached === null && this.providers.cache !== null) {
      const singleCacheItem = {
        collection: this.collection,
        entityId: entityId
      }
      await this.providers.cache.addItem(
        singleCacheItem,
        JSON.stringify(Data)
      )
    }

    if (undefined !== options) {
      if (!options.allow_archived_record && Model.archived_at !== null) {
        throw new ArchivedRecordException(Model.entity_id)
      }
    }

    return EntityToolkit.serialize(Model) 

  }

  /**
   * Ingests data into the model
   * @param Data 
   */
  private ingest(Model: TModel, Data: any){
    for (const key in Data) {
      if (BaseRepository.isDateObject(Data[key])) {
        Model[key] = TimeStamp.normalize(Data[key])
      } else {
        Model[key] = Data[key]
      }
    }
  }

  /**
   * Creates a new record in the model, ensuring all fields are validated.
   * @param data - The data object containing fields to be set in the model, 
   * excluding reserved fields.
   */
  create(
    entityId: Core.Entity.Id, 
    data: Omit<{[K in keyof TModel]: unknown}, Core.Entity.ReservedFields>
  ): Readonly<DatabaseTransactionStep> {
    if (this.containsReservedFields(data)){
      throw new OverridingReservedFieldsException(data)
    }
    const Model = new this.model()
    try {
      for (const key in data) {
        Model[key] = data[key]
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'create data contains one or more invalid fields',
        data: {
          data: data,
          error: error
        }
      })
    }
    Model.entity_id = entityId
    Model.created_at = TimeStamp.now()
    Model.updated_at = TimeStamp.now()
    Model.archived_at = null
    return this.providers.database.createRecord(
      this.collection,
      BaseRepository.flattenAsDatabaseRecord(
        EntityToolkit.serialize(Model)
      )
    )
  }

  /**
   * Updates an existing record in the model, ensuring all fields are validated.
   * @param data - A partial data object containing fields to update, 
   * excluding reserved fields.
   */
  async update(
    Model: WithReservedFields<TModel, 'entity_id' | 'created_at' | 'updated_at'>
  ): Promise<Readonly<DatabaseTransactionStep>> {
    const UpdatedModel = new this.model()
    for (const key in Model) {
      UpdatedModel[key] = Model[key]
    }
    UpdatedModel.updated_at = TimeStamp.now()
    /** Removing any cached data of this model */
    if (this.providers.cache !== null) {
      await this.providers.cache.flushItem({
        collection: this.collection,
        entityId: UpdatedModel.entity_id
      })
    }
    return this.providers.database.updateRecord(
      this.collection,
      BaseRepository.flattenAsDatabaseRecord(
        EntityToolkit.serialize(UpdatedModel)
      )
    )
  }

  private containsReservedFields(data: {[key:string]: any}): boolean {
    const reserved: Array<Core.Entity.ReservedFields> 
      = ['id', 'entity_id', 'created_at', 'updated_at']
    for (const key in data) {
      if (reserved.includes(key as Core.Entity.ReservedFields)) {
        return true
      }
    }
    return false
  }

  private static isDateObject(value: unknown) {
    if (typeof value !== 'object') return false
    return value instanceof Date
  }

  private hasMissingReservedFields(data: { [key: string]: any }): boolean {
    const reserved: Array<Core.Entity.ReservedFields>
      = ['entity_id', 'created_at', 'updated_at']
    for (const field of reserved) {
      if (!(field in data)) {
        return true
      }
    }
    return false
  }

  public static flattenAsDatabaseRecord(model: ReturnType<typeof EntityToolkit.serialize>): FlatDatabaseRecord {
    const transformed: FlatDatabaseRecord = Object.create(null)
    for (const key in model) {
      const value = model[key]
      if (
        typeof value === 'string' ||
        typeof value === 'boolean' || 
        typeof value === 'number' || 
        value === null
      ) {
        transformed[key] = value
      }
    }
    return transformed
  }

}