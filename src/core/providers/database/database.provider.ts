import { Core } from "../../core.types"

/**
 * Implementing this as interface involves executing operations (e.g., create, update, query)
 * that can be wrapped in a transaction using `DatabaseTransactionStep`.
 */
export abstract class AbstractDatabaseProvider {
  /**
   * Establishes a connection to the database.
   */
  abstract connect(): Promise<boolean>

  /**
   * Creates a document in a NoSQL database, or a row in a relational database table.
   * @param collectionName - The name of the collection or table.
   * @param record - The record to be created.
   */
  abstract createRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): Readonly<DatabaseTransactionStep>

  /**
   * Begins a transaction with a series of database operations.
   * @param transactionableActions - Array of actions to be performed within the transaction.
   */
  abstract beginTransaction(transactionableActions: Array<Readonly<DatabaseTransactionStep>>): Promise<void>

  /**
   * Queries a collection or table for records where the specified field has the given value.
   * @param collectionName - The name of the collection or table.
   * @param fieldName - The name of the field to filter by.
   * @param value - The value to match against.
   */
  abstract whereFieldHasValue(
    collectionName: string,
    fieldName: string,
    value: string | number | boolean | null
  ): Promise<Array<FlatDatabaseRecord>>

  /**
   * Retrieves a single record by its ID.
   * @param id - The unique ID of the record.
   */
  abstract getRecordById(collectionName: string, id: Core.Entity.Id): Promise<Array<FlatDatabaseRecord>>

  /**
   * Retrieves multiple records by their IDs.
   * @param ids - An array of record IDs.
   */
  abstract getRecordsByIds(collectionName: string, ids: Array<Core.Entity.Id>): Promise<Array<FlatDatabaseRecord>>

  /**
   * Updates a record by its ID.
   * @param collectionName - The name of the collection or table.
   * @param record - The record with updated values.
   */
  abstract updateRecord(
    collectionName: string,
    record: FlatDatabaseRecord
  ): Readonly<DatabaseTransactionStep>

  /**
   * Executes a query wrapped in a DatabaseTransactionableAction and returns the result.
   * @param transactionableAction - The action containing the query and data bindings.
   */
  abstract useQuery(
    transactionableAction: DatabaseTransactionStep
  ): Promise<Array<{ [key: string]: any }>>
}

/**
 * A flat key-value object representing a database record.
 * Nested objects are not supported.
 */
export type FlatDatabaseRecord = { [key: string]: string | number | boolean | null }

/**
 * Represents a single database operation, potentially within a transaction.
 */
export type DatabaseTransactionStep = {
  /**
   * The namespace of the transaction
   */
  namespace: string
  /**
   * The type of step
   */
  type: 'create' | 'read' | 'update' | 'delete'
  /**
   * The query string to be used for a single operation.
   */
  query: string
  /**
   * The data that populates the placeholders in the query, if any.
   */
  data: FlatDatabaseRecord
}
