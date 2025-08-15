import * as mysql from "mysql";
import type {
  MySqlPool,
  MySqlError,
  PoolConfig,
  PoolNamespace,
} from "./mysql.types";
import { logError, logInfo } from "../../application/appLogger";

/**
 * MySQL Pool Manager - Manages MySQL connection pools.
 * Handles connection creation, retrieval, and cleanup.
 * This class is a singleton and should be used to manage MySQL pools across the application.
 * It ensures that only one connection pool is created per hostname and provides methods to connect, retrieve, and close pools.
 */
export class MySQLPoolManager {
  private static pools: Map<PoolNamespace, MySqlPool> = new Map();

  private static connecting: Map<string, Promise<void>> = new Map();

  private static poolLastUsed: Map<string, number> = new Map();

  /**
   * Connect to a MySQL database and create a connection pool.
   * @param hostname
   * @param config
   * @returns
   */
  public static async connect(
    hostname: string,
    config: Omit<PoolConfig, "host">
  ): Promise<void> {
    if (this.pools.has(hostname)) return;

    if (this.connecting.has(hostname)) {
      return this.connecting.get(hostname)!;
    }

    /**
     * We are returning this Promise to anyone who tries to invoke this
     * connect method when we are still trying to create connection within
     */
    const connectPromise = new Promise<void>((resolve, reject) => {
      const pool: MySqlPool = mysql.createPool({ host: hostname, ...config });

      pool.on("connection", (conn) => {
        conn.on("error", (error: MySqlError) => {
          if (error.fatal) {
            logError({
              severity: 1,
              message: "mysql connection fatal error",
              data: { error: error },
            });
            return reject(error);
          } else {
            logError({
              severity: 1,
              message: "mysql connection non-fatal error",
              data: { error: error },
            });
          }
        });
      });

      /** Test connection */
      pool.getConnection((error, connection) => {
        if (error) {
          logError({
            severity: 1,
            message: "mysql error on test connection",
            data: { error: error },
          });
          return reject(error);
        }
        connection.release();
        this.pools.set(hostname, pool);
        this.poolLastUsed.set(hostname, Date.now());
        return resolve();
      });
    });

    const connectWithTimeout = Promise.race([
      connectPromise,
      new Promise<void>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error(`Connection to ${hostname} timed out after 10s`)),
          10_000
        )
      ),
    ]);

    this.connecting.set(hostname, connectWithTimeout);
    try {
      await connectWithTimeout;
    } finally {
      this.connecting.delete(hostname);
    }
    return;
  }

  /**
   * Get an existing pool. Throws if not connected.
   */
  public static getPool(hostname: string): MySqlPool {
    const pool = this.pools.get(hostname);
    if (!pool) {
      throw new Error(
        `MySQL pool for "${hostname}" has not been connected yet.`
      );
    }
    this.poolLastUsed.set(hostname, Date.now());
    return pool;
  }

  /**
   * Gracefully close all pools.
   */
  public static async closeAllPools(): Promise<void> {
    const closePromises = Array.from(this.pools.entries()).map(
      ([hostname, pool]) => {
        return new Promise<void>((resolve, reject) => {
          pool.end((err) => {
            if (err) {
              console.error(`Error closing pool for ${hostname}`, err);
              reject(err);
            } else {
              console.log(`Closed pool for ${hostname}`);
              resolve();
            }
          });
        });
      }
    );

    await Promise.all(closePromises);
    this.pools.clear();
  }

  /**
   * Close unused pool
   */
  public static async closeUnusedPool() {
    const now = Date.now();

    for (const [hostname, pool] of this.pools) {
      const lastUsed = this.poolLastUsed.get(hostname) ?? 0;
      const age = now - lastUsed;

      if (age > 5 * 60 * 1000) {
        // 5 minutes
        await new Promise<void>((resolve, reject) => {
          pool.end((err) => {
            if (err) return reject(err);
            logInfo(`Closed idle pool: ${hostname}`);
            resolve();
          });
        });
        this.pools.delete(hostname);
        this.poolLastUsed.delete(hostname);
      }
    }
  }
}
