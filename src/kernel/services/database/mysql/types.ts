import { DatabaseRecordDTO } from "../interface"

/**
 * Represents a MySQL database connection, encapsulating methods
 * for managing transactions, queries, and connection events.
 */
export type MySqlDatabaseConnection = {
  connect: (callback: (...params: any) => void) => void
  query: (
    query: string | null,
    items: Array<any> | ((...params: any) => void),
    callback?: (...params: any) => void
  ) => void
  rollback: (callback: (...params: any) => void) => void
  commit: (callback: (...params: any) => void) => void
  beginTransaction: (callback: (...params: any) => void) => void
  on: (event: string, callback: (...params: any) => void) => void
  end: () => void
}

/**
 * Represents a single SQL query with its associated data.
 */
export type MySqlSingleQuery = {
  /** The query string to be used for a single operation */
  query: string
  /** The data that populates the placeholders in the array */
  data: DatabaseRecordDTO | Array<string | number | boolean | null>
}

/**
 * Parameters required for establishing a MySQL connection.
 */
export type MySqlCreateConnectionParams = {
  /** Database server hostname. */
  host: string
  /** Username for database authentication. */
  user: string
  /** Password for database authentication. */
  password: string
  /** Name of the database to connect to. */
  database: string
  /** Optional SSL configuration for secure connections. */
  ssl?: {
    /** CA certificate for SSL. */
    ca: string
  }
}