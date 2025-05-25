import { LogicException} from "../../../exceptions/exceptions";
import { Pseudorandom } from "../../../helpers/pseudorandom";
import { Entity } from "../../../interface";
import { DatabaseCreateOptions, DatabaseGetOptions, DatabaseProviderInterface, DatabaseSingleTransaction, DatabaseUpdateOptions, DatabaseWhereFieldOptions } from "../interface";
import { SessionDBHelper } from "./sessiondb-helper";

const __data = {}
const __stat_number_of_connect = {}
const __stat_number_of_get = {}

/**
 * A not-actually database that should only be used for testing. 
 * Data is stored in a JSON file somewhere.
 */
export class SessionDBClient implements DatabaseProviderInterface {

  private sessionId: string

  constructor(){
    this.sessionId = Pseudorandom.alphanum32()
    __data[this.sessionId] = {}
    __stat_number_of_connect[this.sessionId] = 0
    __stat_number_of_get[this.sessionId] = 0
  }

  async connect(): Promise<boolean> {
    __stat_number_of_connect[this.sessionId]++
    return true
  }

  /**
   * @see DatabaseCreateOptions
   */
  create(): DatabaseCreateOptions {
    return {

      /**
       * A collection in a No-SQL database, and a table in a relational database
       * @param query - (optional) A create table query if the storage provider requires
       * to create tables
       */
      collection: (): void => {
        throw new LogicException({
          message: 'method not implemented',
          data: {method: 'SessionDBClient.create.collection'}
        })
      },

      /**
       * A document in a No-SQL database, a row in a relational database table.
       * @param collection
       * @param entity 
       */
      entity: (collection, entity)=>{
        return SessionDBHelper.Transactions.single(
          'key.create',
          collection,
          entity
        )
      }
    }
  }

  /**
   * Checks whether a certain record represented by Entity Id 
   * exists in the database
   * @param collection 
   * @param entityId 
   * @returns 
   */
  async doExist(collection: string, entityId: Entity.Id): Promise<boolean> {
    const data = __data[this.sessionId]
    if (!(collection in data)) {
      return false
    }
    if (!(entityId in data[collection])) {
      return false
    }
    return true
  }

  async beginTransaction(singleOps: DatabaseSingleTransaction[]): Promise<null> {
    for (let i = 0; i < singleOps.length; i++) {
      const singleOp = singleOps[i]
      const [type, collection] 
        = singleOp.query.split('//')
      /** Existing data retrieved from memory */
      const ExistingData = __data[this.sessionId]
      const entityId = singleOp.data.entity_id

      if (type === 'key.create') {
        if (!(collection in ExistingData)) {
          ExistingData[collection] = {}
        }
        if (typeof entityId !== 'boolean' && entityId !== null) {
          ExistingData[collection][entityId] = JSON.parse(JSON.stringify(singleOp.data))
        }
        continue
      }

      if (type === 'key.update') {
        if (!(collection in ExistingData)) {
          throw new Error(`Attempt to retrieve `
          + `non-existing collection ${collection} from sessiondb`)
        }
        if (typeof entityId !== 'boolean' && entityId !== null && !(entityId in ExistingData[collection])) {
          throw new Error(`Attempt to update non-existing entity_id `
          + `${entityId} in collection ${collection}`)
        }
        if (typeof entityId !== 'boolean' && entityId !== null) {
          ExistingData[collection][entityId] = JSON.parse(JSON.stringify(singleOp.data))
        }
        continue
      }
    }

    return null

  }

  get(): DatabaseGetOptions {
    return {
      entity: async (collection, entityId) => {
        __stat_number_of_get[this.sessionId]++
        const ExistingData 
          = __data[this.sessionId]
        if (!(collection in ExistingData)) {
          return []
        }
        if (!(entityId in ExistingData[collection])) {
          return []
        }
        const result = SessionDBHelper.clone(
          ExistingData[collection][entityId]
        )
        return [result]
      },
      list: () => {
        throw new Error(
          'SessionDBClient.get().list() not implemented'
        )
      },
      entities: async (collection, entityIds) => {
        __stat_number_of_get[this.sessionId]++
        const results: any = []
        const ExistingData = __data[this.sessionId]
        if (!(collection in ExistingData)) return results
        for (let i = 0; i < entityIds.length; i++) {
          const entityId = entityIds[i]
          if (entityId in ExistingData[collection]) {
            const result = SessionDBHelper.clone(
              ExistingData[collection][entityId]
            )
            results.push(result)
          }
        }
        return results
      }
    }
  }

  whereField(collection: string, field: string): DatabaseWhereFieldOptions {
    return {
      hasValue: async (value) => {
        const results: Array<{[key:string]:any}> = []
        const ExistingData = __data[this.sessionId]
        if (!(collection in ExistingData)) return results
        for (const entityId in ExistingData[collection]) {
          const data = ExistingData[collection][entityId]
          if (!(field in data)) continue 
          if (data[field] === value) {
            const result = SessionDBHelper.clone(
              ExistingData[collection][entityId]
            )
            results.push(result)
          }
        }
        return results
      }
    }
  }

  update(): DatabaseUpdateOptions {
    return {
      entity: (collection, data) => {
        return SessionDBHelper.Transactions.single(
          'key.update',
          collection,
          data
        )
      }
    }
  }

  query(singleOperation: DatabaseSingleTransaction): Promise<{ [key: string]: any; }[]> {
    throw new Error(
      'SessionDBClientClient.query() not implemented'
    )
  }

  dump(){
    return __data[this.sessionId]
  }

  import(data: {[key:string]: any}){
    __data[this.sessionId] = data
  }

  stats(){
    return {
      number_of_connections: __stat_number_of_connect[this.sessionId],
      number_of_get_invocations: __stat_number_of_get[this.sessionId]
    }
  }

}