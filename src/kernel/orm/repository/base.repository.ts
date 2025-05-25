import { BaseEntity } from "../entity/entity";
import { ArchivedRecordException, BadRequestException, DataIntegrityException, LogicException, RecordNotFoundException } from "../../exceptions/exceptions";
import { thisJSON } from "../../helpers/thisjson";
import { TimeStamp } from "../../helpers/timestamp";
import { Entity } from "../../interface";
import { DatabaseRecordDTO, DatabaseSingleTransaction } from "../../services/database/interface";
import { RepositoryHelper } from "./helpers";
import { RepositoryGetOptions, RepositoryServiceProviders } from "./types";
import { EntityToolkit } from "../entity/toolkit";

export class BaseRepository<TModel extends BaseEntity<TModel>> {
  
  /**
   * In NoSQL databases, the collection refers to the database collection itself. 
   * On the other hand, on relational database, this collection value refers
   * to the name of the database table
   */
  protected readonly collection: string

  /**
   * The EntityID of the TEntityObject
   */
  protected entity_id: Entity.Id

  /**
   * The TEntityObject itself
   */
  protected readonly model: TModel

  /**
   * Determines whether we've already imported data to the
   * linked model or not. This allows us to avoid querying
   * the database provider once again after calling the 
   * Repository:get method
   */
  private modelInitialized: boolean = false

  /**
   * Binds service providers to a Repository instance
   */
  protected readonly providers: RepositoryServiceProviders

  /**
   * You can't do create and update within a single repository instance. 
   * After calling either of them, a lock is put in place to avoid
   * executing the other action
   */
  protected lockedTransaction: null | 'create' | 'update'

  constructor(entity_id?: Entity.Id){
    if (entity_id !== undefined && entity_id !== null) {
      this.entity_id = entity_id
    }
    this.lockedTransaction = null
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
   * Retrieves the model with all its fields rendered as readonly. 
   * @returns The model object.
   */
  async get(options?: RepositoryGetOptions): Promise<Readonly<Record<keyof TModel, TModel[keyof TModel]>>>{
    await this.initproviders()
    const model = this.model

    /** First, we'll try to see if the model has been previously initialized */
    if (this.modelInitialized) {
      return EntityToolkit.serialize(this.model)
    }

    /** If not, then, we'll attempt to retrieve data from cache */
    let cached: string | null = null
    if (this.providers.cache !== null) {
      cached = await this.providers.cache.getItem({
        collection: this.collection,
        entityId:   this.entity_id
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
      const results = await this.providers.database.get().entity(
        this.collection,
        this.entity_id
      )
      if (results.length === 0) {
        throw new RecordNotFoundException({
          message: 'record not found from database',
          data: {entity_id: this.entity_id, collection: this.collection}
        })
      }
      if (results.length > 1) {
        throw new DataIntegrityException({
          message: `multiple records under the same entity_id and collection`,
          data: {entity_id: this.entity_id, collection: this.collection}
        })
      }
      Data = results[0]
    }

    RepositoryHelper.throwErrorWhen.data.hasMissingReservedFields(Data)
    
    try {
      this.ingest(Data)
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
        entityId: this.entity_id
      }
      await this.providers.cache.addItem(
        singleCacheItem,
        JSON.stringify(Data)
      )
    }

    if (undefined !== options) {
      if (!options.allow_archived_record && this.model.archived_at !== null) {
        throw new ArchivedRecordException(this.model.entity_id)
      }
    }

    this.modelInitialized = true
    return EntityToolkit.serialize(this.model)

  }

  /**
   * Ingests data into the model
   * @param Data 
   */
  private ingest(Data: any){
    for (const key in Data) {
      if (RepositoryHelper.isDateObject(Data[key])) {
        this.model[key] = TimeStamp.normalize(Data[key])
      } else {
        this.model[key] = Data[key]
      }
    }
  }

  import(Data: Readonly<Record<keyof TModel, TModel[keyof TModel]>>): void {
    try {
      this.ingest(Data)
    } catch (error) {
      throw new DataIntegrityException({
        message: 'imported record contains invalid data',
        data: {
          collection: this.collection,
          data: Data,
          error: error
        }
      })
    }
    this.modelInitialized = true
  }

  /**
   * Creates a new record in the model, ensuring all fields are validated.
   * @param data - The data object containing fields to be set in the model, 
   * excluding reserved fields.
   */
  create(data: Omit<{[K in keyof TModel]: unknown}, Entity.ReservedFields>){
    RepositoryHelper.throwErrorWhen.transaction.isLocked(this.lockedTransaction)
    RepositoryHelper.throwErrorWhen.data.containsReservedFields(data)
    try {
      for (const key in data) {
        this.model[key] = data[key]
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
    this.model.entity_id = this.entity_id
    this.model.created_at = TimeStamp.now()
    this.model.updated_at = TimeStamp.now()
    this.model.archived_at = null
    this.modelInitialized = true
    this.lockedTransaction = 'create'
  }

  /**
   * Updates an existing record in the model, ensuring all fields are validated.
   * @param data - A partial data object containing fields to update, 
   * excluding reserved fields.
   */
  update(data: Partial<Omit<{[K in keyof TModel]: unknown}, Entity.ReservedFields>>){
    RepositoryHelper.throwErrorWhen.model.hasNotInitialized(this.modelInitialized)
    RepositoryHelper.throwErrorWhen.transaction.isLocked(this.lockedTransaction)
    RepositoryHelper.throwErrorWhen.data.containsReservedFields(data)
    try {
      for (const key in data) {
        this.model[key] = data[key]
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
    this.model.updated_at = TimeStamp.now()
    this.lockedTransaction = 'update'
  }

   /**
   * Archives the model by setting the `archived_at` timestamp to the current UTC time.
   * There will a service that checks if this value isn't null, and deletes the record 
   * if it is X days ago.
   */
  archive(data?: Partial<Omit<{[K in keyof TModel]: unknown}, Entity.ReservedFields>>){
    RepositoryHelper.throwErrorWhen.model.hasNotInitialized(this.modelInitialized)
    RepositoryHelper.throwErrorWhen.transaction.isLocked(this.lockedTransaction)
    if (data !== undefined) {
      this.update(data)
    }
    this.model.archived_at = TimeStamp.now()
    this.model.updated_at = TimeStamp.now()
    this.lockedTransaction = 'update'
  }

  /**
   * Reactivates the model by setting the `archived_at` field to null.
   */
  reactivate(data?: Partial<Omit<{[K in keyof TModel]: unknown}, Entity.ReservedFields>>){
    RepositoryHelper.throwErrorWhen.model.hasNotInitialized(this.modelInitialized)
    RepositoryHelper.throwErrorWhen.transaction.isLocked(this.lockedTransaction)
    if (data !== undefined) {
      this.update(data)
    }
    this.model.archived_at = null
    this.model.updated_at = TimeStamp.now()
    this.lockedTransaction = 'update'
  }

  configs(){
    return {
      CacheProvider: () => {
        if (this.providers.cache===undefined||this.providers.cache===null) {
          throw new LogicException({
            message: 'attempt to retrieve non-existing cache provider',
            data: {collection: this.collection}
          })
        }
        return this.providers.cache
      },
      collection: () => {
        return this.collection
      }
    }
  }

  async commit() {
    let transaction: DatabaseSingleTransaction | null = null 
    const model = EntityToolkit.serialize(this.model)
    switch(this.lockedTransaction) {
      case 'create': 
        await this.initproviders()
        transaction 
          = this.providers.database.create().entity(
            this.collection,
            RepositoryHelper.toDatabaseRecordDTO(model)
          )
        break
      case 'update': 
        /** Removing any cached data of this model */
        if (this.providers.cache !== null) {
          this.providers.cache.flushItem({
            collection: this.collection,
            entityId: this.model.entity_id
          })
        }
        transaction 
          = this.providers.database.update().entity(
            this.collection,
            RepositoryHelper.toDatabaseRecordDTO(model)
          )
        break
      default: 
        throw new LogicException({
          message: `committing changes without any transaction`,
          data: {entity_id: this.entity_id, collection: this.collection}
        })
        break
    }

    if (transaction !== null) {
      await this.providers.database.beginTransaction([transaction])
    }
  }



}