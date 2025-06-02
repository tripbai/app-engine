import { FlatDatabaseRecord } from "../database.provider"

/**
 * Overrides the DatabaseTransactionStep
 */
export type MySqlTransactionStep = {

  /**
   * The namespace of the transaction
   */
  namespace: string
  
  /**
   * The type of step
   */
  type: 'create' | 'read' | 'update' | 'delete'

  /** The query string to be used for a single operation */
  query: string

  /** The data that populates the placeholders in the array */
  data: FlatDatabaseRecord | Array<string | number | boolean | null>

}