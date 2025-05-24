import { BaseEntity } from "../../entity/entity"
import { Entity } from "../../interface"

export type DatabaseSingleTransaction = {
  /** The query string to be used for a single operation */
  query: string 
  /** The data that populates the placeholders in the query, if there is any */
  data: { [key:string]: string | number | boolean | null }
}

export type DatabaseRecordDTO = { [key:string]: string | number | boolean | null}

/**
 * Things that you can create in a database
 */
export type DatabaseCreateOptions = {

  /**
   * A collection in a No-SQL database, and a table in a relational database
   * @param query - (optional) A create table query if the storage provider requires
   * to create tables
   */
  collection(query:string|null):void

  /**
   * A document in a No-SQL database, a row in a relational database table.
   * @param collection
   * @param entity 
   */
  entity(collection: string, entity: DatabaseRecordDTO): DatabaseSingleTransaction
}

export type DatabaseGetOptions = {
  /**
   * Retrieves a single record from a database.
   * 
   * In a relational database, this method fetches a row from the specified table. 
   * In a non-relational database, it retrieves a document from the specified collection.
   * 
   * @param collection - The name of the database table (for relational) or collection (for non-relational) to query.
   * @param entityId - The unique identifier of the record or document to retrieve.
   * @returns A promise that resolves to an object representing the fetched entity.
   */
  entity(collection: string, entityId: Entity.Id): Promise<Array<DatabaseRecordDTO>>;

  list(collectionName:string,listName:string,value:string|number,limit?:number|null):Promise<Array<{entity_id:Entity.Id}>>

  /**
   * Retrieves multiple records from a database.
   * 
   * In a relational database, this method fetches a row from the specified table. 
   * In a non-relational database, it retrieves a document from the specified collection.
   * 
   * @param collection - The name of the database table (for relational) or collection (for non-relational) to query.
   * @param entityIds - The unique identifier of the record or document to retrieve.
   */
  entities(collection: string, entityIds: Array<Entity.Id>): Promise<Array<DatabaseRecordDTO>>;

  /** Relevant only for relational databases that support Primary IDs */
  byPrimaryId?(collectionName:string,primaryID:number): Promise<Array<DatabaseRecordDTO>>
}

export type DatabaseUpdateOptions = {
  /**
   * A document in a No-SQL database, a row in a relational database table.
   * @param collection - the name of the collection or table to be updated
   * @param data - an object of key-value pairs, representing the column and values.
   */
  entity(collection:string, data: DatabaseRecordDTO): DatabaseSingleTransaction

}

export type DatabaseWhereFieldOptions = {
  hasValue:(fieldValue: string | number | boolean)=>Promise<Array<{[key:string]: any}>>
}


export type RequiredDataForDatabaseUpdates = {
  entity_id: Entity.Id
}

/**
 * An interface for any Storage Provider. When implementing this interface,
 * it requires you to define a 'SingleOperation'. A SingleOperation, as 
 * the name suggest, is a single operation that can be executed "within"
 * a transaction.
 */
export interface DatabaseProviderInterface {
  connect():Promise<boolean>
  create():DatabaseCreateOptions
  beginTransaction(singleOperations:Array<DatabaseSingleTransaction>):Promise<null>
  whereField(collectionName: string, fieldName: string): DatabaseWhereFieldOptions
  get():DatabaseGetOptions
  update():DatabaseUpdateOptions
  query(singleOperation:DatabaseSingleTransaction):Promise<Array<{[key: string]: any}>>
}