import { BaseEntity } from "../entity/base-entity";
import { RepositoryServiceProviders } from "./types";
import * as Core from "../../module/types";
import { getTimestampNow, normalizeTimestamp } from "../../utilities/timestamp";
import { isParsableJSON } from "../../utilities/jsonHelper";
import {
  ArchivedRecordException,
  DataIntegrityException,
  InvalidArgumentException,
  RecordNotFoundException,
} from "../../exceptions/exceptions";
import { assertValidRecord } from "../../utilities/assertValid";
import { assertFlatDatabaseRecord } from "./assertions";
import { FlatDatabaseRecord } from "../../providers/database/database.provider";
import { createEntityId, flattenEntity } from "../../utilities/entityToolkit";
import { UnitOfWork } from "../../workflow/unit-of-work";
import { OverridingReservedFieldsException } from "./exceptions";

export class BaseRepository<TModel extends BaseEntity> {
  constructor(
    /**
     * In NoSQL databases, the collection refers to the database collection itself.
     * On the other hand, on relational database, this collection value refers
     * to the name of the database table
     */
    private readonly collection: string,

    /**
     * The class definition of TModel itself
     */
    private readonly model: new (...args: any[]) => TModel,

    /**
     * Binds service providers to a Repository instance
     */
    private readonly providers: RepositoryServiceProviders
  ) {}

  /**
   * Connection has to be made to external service providers before they
   * can be used. This method allows the Repository to connect to the
   * declared service providers
   */
  protected async initproviders(): Promise<boolean> {
    if ("connect" in this.providers.database) {
      await this.providers.database.connect();
    }
    if ("connect" in this.providers.cache) {
      await this.providers.cache.connect();
    }
    return true;
  }

  /**
   * Retrieves an entity by its ID
   * @param entityId The ID of the entity to retrieve
   * @returns The entity if found
   */
  async getById(entityId: Core.Entity.Id): Promise<TModel> {
    const model = await this.getByIdWithArchived(entityId);
    if (model.archived_at !== null) {
      throw new ArchivedRecordException(model.entity_id);
    }
    return model;
  }

  /**
   * Retrieves an entity by its ID, including archived entities
   * @param entityId The ID of the entity to retrieve
   * @returns The entity if found
   */
  async getByIdWithArchived(entityId: Core.Entity.Id): Promise<TModel> {
    await this.initproviders();
    // we'll first attempt to retrieve data from cache
    let recordExistsInCache = true;
    let entityRecord = await this.getFromCacheById(entityId);
    if (entityRecord === null) {
      // if not found in cache, retrieve from database
      recordExistsInCache = false;
      entityRecord = await this.getFromDatabaseById(entityId);
    }
    if (this.hasMissingReservedFields(entityRecord)) {
      throw new DataIntegrityException({
        message: "database record has missing required entity fields",
        data: {
          collection: this.collection,
          data: entityRecord,
        },
      });
    }
    const model = new this.model();
    try {
      this.ingestIntoModel(model, entityRecord);
    } catch (error) {
      throw new DataIntegrityException({
        message: "database record contains invalid data",
        data: {
          collection: this.collection,
          record: entityRecord,
          error: error,
        },
      });
    }
    if (!recordExistsInCache) {
      await this.storeToCache(model);
    }
    return model;
  }

  async getFromDatabaseById(
    entityId: Core.Entity.Id
  ): Promise<FlatDatabaseRecord> {
    await this.initproviders();
    const results = await this.providers.database.getRecordById(
      this.collection,
      entityId
    );
    if (results.length === 0) {
      throw new RecordNotFoundException({
        message: "record not found from database",
        data: { entity_id: entityId, collection: this.collection },
      });
    }
    if (results.length > 1) {
      throw new DataIntegrityException({
        message: `multiple records under the same entity_id and collection`,
        data: { entity_id: entityId, collection: this.collection },
      });
    }
    const data = results[0];
    assertFlatDatabaseRecord(data);
    return data;
  }

  async storeToCache(model: TModel) {
    await this.initproviders();
    const flattenedRecord = flattenEntity(model);
    await this.providers.cache.addItem(
      { collection: this.collection, entityId: model.entity_id },
      JSON.stringify(flattenedRecord)
    );
  }

  async getFromCacheById(
    entityId: Core.Entity.Id
  ): Promise<FlatDatabaseRecord | null> {
    await this.initproviders();
    const cachedData = await this.providers.cache.getItem({
      collection: this.collection,
      entityId: entityId,
    });
    if (cachedData === null) return null;
    if (!isParsableJSON(cachedData)) {
      throw new DataIntegrityException({
        message: `cached json data is not parsable`,
        data: { json: cachedData },
      });
    }
    const parsedData = JSON.parse(cachedData);
    assertFlatDatabaseRecord(parsedData);
    return parsedData;
  }

  /**
   * Ingests data into the model
   * @param data
   */
  protected ingestIntoModel(model: TModel, data: { [key: string]: any }): void {
    for (const key in data) {
      const typedKey = key as keyof TModel;
      if (BaseRepository.isDateObject(data[key])) {
        model[typedKey] = normalizeTimestamp(
          data[key]
        ) as TModel[typeof typedKey];
      } else {
        model[typedKey] = data[key];
      }
    }
  }

  private hasMissingReservedFields(data: { [key: string]: any }): boolean {
    const reserved: Array<Core.Entity.ReservedFields> = [
      "entity_id",
      "created_at",
      "updated_at",
      "archived_at",
    ];
    for (const field of reserved) {
      if (!(field in data)) {
        return true;
      }
    }
    return false;
  }

  protected static isDateObject(value: unknown) {
    if (typeof value !== "object") return false;
    return value instanceof Date;
  }

  /**
   * Creates a new record in the model, ensuring all fields are validated.
   * @param data - The data object containing fields to be set in the model,
   * excluding reserved fields.
   */
  create(
    data: Omit<{ [K in keyof TModel]: TModel[K] }, Core.Entity.ReservedFields>,
    unitOfWork: UnitOfWork
  ): TModel {
    if (this.containsReservedFields(data)) {
      throw new OverridingReservedFieldsException(data);
    }
    const model = new this.model();
    try {
      this.ingestIntoModel(model, data);
    } catch (error) {
      throw new InvalidArgumentException({
        message: "create data contains one or more invalid fields",
        data: {
          data: data,
          error: error,
        },
      });
    }
    model.entity_id = createEntityId();
    model.created_at = getTimestampNow();
    model.updated_at = getTimestampNow();
    model.archived_at = null;
    const flattenedRecord = flattenEntity(model);
    const transactionStep = this.providers.database.createRecord(
      this.collection,
      flattenedRecord
    );
    unitOfWork.addTransactionStep(transactionStep);
    return model;
  }

  /**
   * Updates an existing record in the model, ensuring all fields are validated.
   * @param data - A partial data object containing fields to update,
   * excluding reserved fields.
   */
  async update(model: TModel, unitOfWork: UnitOfWork): Promise<void> {
    const updatedModel = model;
    this.ingestIntoModel(updatedModel, model);
    updatedModel.updated_at = getTimestampNow();
    /** Removing any cached data of this model */
    if (this.providers.cache !== null) {
      await this.providers.cache.flushItem({
        collection: this.collection,
        entityId: updatedModel.entity_id,
      });
    }
    const flattenedRecord = flattenEntity(updatedModel);
    const transactionStep = this.providers.database.updateRecord(
      this.collection,
      flattenedRecord
    );
    unitOfWork.addTransactionStep(transactionStep);
    return;
  }

  private containsReservedFields(data: { [key: string]: any }): boolean {
    const reserved: Array<Core.Entity.ReservedFields> = [
      "id",
      "entity_id",
      "created_at",
      "updated_at",
      "archived_at",
    ];
    for (const key in data) {
      if (reserved.includes(key as Core.Entity.ReservedFields)) {
        return true;
      }
    }
    return false;
  }
}
