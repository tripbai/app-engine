import { inject, injectable } from "inversify";
import { AbstractDatabaseProvider, DatabaseTransactionStep, FlatDatabaseRecord } from "../database.provider";
import { JSONFileHelper } from "./jsonfile-helper";
import { EntityToolkit } from "../../../orm/entity/entity-toolkit";
import { Core } from "../../../module/module";

@injectable()
export class JSONFileDB implements AbstractDatabaseProvider {

  constructor(
    @inject(JSONFileHelper) private readonly jsonFileHelper: JSONFileHelper
  ){}

  async connect(): Promise<boolean> {
    return true
  }

  createRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): Readonly<DatabaseTransactionStep> {
    return {
      executor: this,
      type: 'create',
      query: 'key.create//' + collectionName,
      data: record
    }
  }

  updateRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): Readonly<DatabaseTransactionStep> {
    return {
      executor: this,
      type: 'update',
      query: 'key.update//' + collectionName,
      data: record
    }
  }

  async beginTransaction(transactionableActions: Array<Readonly<DatabaseTransactionStep>>): Promise<void> {
    const existingData = this.jsonFileHelper.getSnapshot()
    for (const action of transactionableActions) {
      const [actionType, collectionName] = action.query.split('//');
      if (!existingData[collectionName]) {
        existingData[collectionName] = {};
      }
      const entityId = action.data.entity_id
      EntityToolkit.Assert.idIsValid(entityId)
      if (actionType === 'key.create') {
        // If entity Id is existing in collection, throw an error
        if (existingData[collectionName][entityId]) {
          throw new Error(`Entity with id ${entityId} already exists in collection ${collectionName}`);
        }
        existingData[collectionName][entityId] = action.data
      } else if (actionType === 'key.update') {
        // If entity Id does not exist in collection, throw an error
        if (!existingData[collectionName][entityId]) {
          throw new Error(`Entity with id ${entityId} does not exist in collection ${collectionName}`);
        }
        // Update the existing entity with new data
        existingData[collectionName][entityId] = action.data
      }
    }
    // Store the updated snapshot back to the file
    this.jsonFileHelper.storeSnapshot()
  }

  async whereFieldHasValue(
    collectionName: string,
    fieldName: string,
    value: string | number | boolean | null
  ): Promise<Array<FlatDatabaseRecord>> {
    const snapshot = this.jsonFileHelper.getSnapshot()
    const clonedSnapshot = this.jsonFileHelper.createClone(snapshot)
    if (!clonedSnapshot[collectionName]) {
      return Promise.resolve([])
    }
    const dataInCollection = clonedSnapshot[collectionName]
    const result: Array<FlatDatabaseRecord> = []
    for (const entityId in dataInCollection) {
      const record = dataInCollection[entityId]
      if (record[fieldName] === value) {
        result.push(record as FlatDatabaseRecord)
      }
    }
    return result
  }

  async getRecordById(collectionName: string, id: Core.Entity.Id): Promise<Array<FlatDatabaseRecord>> {
    const snapshot = this.jsonFileHelper.getSnapshot()
    const clonedSnapshot = this.jsonFileHelper.createClone(snapshot)
    if (!clonedSnapshot[collectionName]) {
      return []
    }
    const dataInCollection = clonedSnapshot[collectionName]
    if (!(id in dataInCollection)) {
      return []
    }
    return [dataInCollection[id] as FlatDatabaseRecord]
  }

  async getRecordsByIds(collectionName: string, ids: Array<Core.Entity.Id>): Promise<Array<FlatDatabaseRecord>> {
    const snapshot = this.jsonFileHelper.getSnapshot()
    const clonedSnapshot = this.jsonFileHelper.createClone(snapshot)
    if (!clonedSnapshot[collectionName]) {
      return []
    }
    const dataInCollection = clonedSnapshot[collectionName]
    const result: Array<FlatDatabaseRecord> = []
    for (const id of ids) {
      if (id in dataInCollection) {
        result.push(dataInCollection[id] as FlatDatabaseRecord)
      }
    }
    return result
  }

  async useQuery(
    transactionableAction: DatabaseTransactionStep
  ): Promise<Array<{ [key: string]: any }>> {
    throw new Error('JSONFileDB.useQuery() not implemented');
  }

}