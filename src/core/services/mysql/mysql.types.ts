export type MySqlError = Error & {
  code?: string;
  errno?: number;
  sqlState?: string;
  fatal?: boolean;
};

export type QueryCallback = (
  err: MySqlError | null,
  results?: any,
  fields?: any
) => void;

export interface MySqlPool {
  getConnection(
    callback: (err: MySqlError | null, connection: MySqlPoolConnection) => void
  ): void;
  query(
    sql: string,
    values?: any[] | { [key: string]: any } | QueryCallback,
    callback?: QueryCallback
  ): void;
  end(callback?: (err: MySqlError | null) => void): void;
  on(event: "connection", callback: (conn: MySqlPoolConnection) => void): void;
}

export type MySqlPoolConnection = {
  query(
    sql: string,
    values?: any[] | { [key: string]: any } | QueryCallback,
    callback?: QueryCallback
  ): void;
  beginTransaction(callback: (err: MySqlError | null) => void): void;
  commit(callback: (err: MySqlError | null) => void): void;
  rollback(callback: () => void): void;
  release(): void;
  on(event: "error", callback: (err: MySqlError) => void): void;
};

export type PoolConfig = {
  user: string;
  password: string;
  database: string;
  port?: number;
  connectionLimit: number;
  acquireTimeout: number;
  waitForConnections: boolean;
  ssl?: {
    ca: string;
  };
};

export type PoolNamespace = string;
