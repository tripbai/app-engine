import { injectable } from "inversify";
import { FlatDatabaseRecord } from "../database.provider";
import { MySqlTransactionStep } from "./mysql.service.d";

@injectable()
export class MySqlTransactionHelper {
  
  /**
   * Generates an SQL `INSERT` command with normalized data.
   *
   * @param collection - The target table name.
   * @param data - The data to insert.
   * @returns A MySqlTransactionStep with an `INSERT` command and normalized data.
   */
  generateInsertTransactionStep(
    collection: string,
    data: FlatDatabaseRecord
  ): MySqlTransactionStep {
    return {
      namespace: 'MySqlService',
      type: 'create',
      query: `INSERT INTO ${collection} SET ?`,
      data: data,
    }
  }

  /**
   * Generates an SQL `UPDATE` command with normalized data, excluding
   * `entity_id`, `created_at`, `updated_at` fields.
   * An exception is thrown if `entity_id` is missing.
   *
   * @param collection - The target table name.
   * @param data - The data to update, including `entity_id` for the `WHERE` clause.
   * @returns A MySqlSingleQuery with an `UPDATE` command and normalized data.
   * @throws {InvalidArgumentException} If `entity_id` is missing from `data`.
   */
  generateUpdateTransactionStep(
    collection: string,
    data: FlatDatabaseRecord
  ): MySqlTransactionStep {
    
    let query = 'UPDATE ' + collection + ' SET '

    /** Contains all the actual updatable columns */
    let datalist: Array<string | number | boolean | null> = []
    const sets: Array<string> = []

    for (const key in data) {
      /** Id cannot be updated and entity_id should be listed last */
      if (key === 'id' || key === 'entity_id') continue
      sets.push(`${key} = ?`)
      datalist.push(data[key])
    }

    query += sets.join(',')
    datalist.push(data['entity_id'])

    return {
      namespace: 'MySqlService',
      type: 'update',
      query: query + ' WHERE entity_id = ?',
      data: datalist,
    }
  }

}