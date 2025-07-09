import { Core } from "../../../module/module"
import { AbstractDatabaseProvider, FlatDatabaseRecord, DatabaseTransactionStep } from "../database.provider"

const db: Map<string, Map<Core.Entity.Id, FlatDatabaseRecord>> = new Map()

export class InMemoryDatabaseService extends AbstractDatabaseProvider {

  async connect(): Promise<boolean> {
    return true
  }

  createRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): Readonly<DatabaseTransactionStep> {
    const entityId = record["entity_id"] as Core.Entity.Id
    if (!entityId || typeof entityId !== "string") {
      throw new Error("Record must have a string 'entity_id' field.")
    }

    const recordCopy = { ...record }

    if (!db.has(collectionName)) {
      db.set(collectionName, new Map())
    }

    const collection = db.get(collectionName)!
    collection.set(entityId, recordCopy)

    return {
      executor: this,
      type: "create",
      query: collectionName,
      data: recordCopy,
    }
  }

  async beginTransaction(
    transactionableActions: Readonly<DatabaseTransactionStep>[]
  ): Promise<void> {
    for (const action of transactionableActions) {
      await this.useQuery(action)
    }
  }

  async whereFieldHasValue(
    collectionName: string,
    fieldName: string,
    value: string | number | boolean | null
  ): Promise<FlatDatabaseRecord[]> {
    const collection = db.get(collectionName)
    if (!collection) return []

    return Array.from(collection.values())
      .filter((record) => record[fieldName] === value)
      .map((record) => ({ ...record }))
  }

  async getRecordById(
    collectionName: string,
    id: Core.Entity.Id
  ): Promise<FlatDatabaseRecord[]> {
    const collection = db.get(collectionName)
    const record = collection?.get(id)
    return record ? [{ ...record }] : []
  }

  async getRecordsByIds(
    collectionName: string,
    ids: Array<Core.Entity.Id>
  ): Promise<FlatDatabaseRecord[]> {
    const collection = db.get(collectionName)
    if (!collection) return []

    return ids
      .map((id) => collection.get(id))
      .filter((record): record is FlatDatabaseRecord => !!record)
      .map((record) => ({ ...record }))
  }

  updateRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): Readonly<DatabaseTransactionStep> {
    const entityId = record["entity_id"] as Core.Entity.Id
    if (!entityId || typeof entityId !== "string") {
      throw new Error("Record must have a string 'entity_id' field.")
    }

    const collection = db.get(collectionName)
    if (!collection || !collection.has(entityId)) {
      throw new Error("Cannot update non-existent record.")
    }

    const recordCopy = { ...record }
    collection.set(entityId, recordCopy)

    return {
      executor: this,
      type: "update",
      query: collectionName,
      data: recordCopy,
    }
  }

  async useQuery(
    transactionableAction: DatabaseTransactionStep
  ): Promise<Array<{ [key: string]: any }>> {
    const { query, type, data } = transactionableAction
    const namespace = query
    const entityId = data["entity_id"] as Core.Entity.Id

    switch (type) {
      case "create":
        this.createRecord(namespace, data)
        return [{ ...data }]
      case "update":
        this.updateRecord(namespace, data)
        return [{ ...data }]
      case "read":
        return this.getRecordById(namespace, entityId)
      case "delete":
        const collection = db.get(namespace)
        if (collection?.has(entityId)) {
          collection.delete(entityId)
          return [{ ...data }]
        }
        return []
      default:
        throw new Error(`Unsupported transaction type: ${type}`)
    }
  }
}