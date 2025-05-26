
import { Application } from "../../../application"
import { LogicException } from "../../../exceptions/exceptions"
import { AppENV } from "../../../helpers/env"
import { AppLogger } from "../../../helpers/logger"
import { Entity } from "../../../interface"
import {
  DatabaseCreateOptions,
  DatabaseGetOptions,
  DatabaseProviderInterface,
  DatabaseSingleTransaction,
  DatabaseUpdateOptions,
  DatabaseWhereFieldOptions,
} from "../interface"
import { FatalMySqlConnectionError, GenericMySqlException, MySqlConnectionError } from "./exceptions"
import { MySqlCommandHelper } from "./helper"
import { MySqlCreateConnectionParams, MySqlDatabaseConnection, MySqlSingleQuery } from "./types"
const fs = require("fs")
const mysql = require("mysql")

/**
 * Connection registry, storing functions to retrieve MySQL connections by hostname.
 */
let CONNECTION: MySqlDatabaseConnection | null = null

/**
 * Establishes a new MySQL connection or reconnects if necessary.
 * @param params - Connection parameters.
 * @param isReconnect - Flag indicating if this is a reconnection attempt.
 * @returns A promise that resolves when the connection is established.
 */
const establishNewConnection = (
  params: MySqlCreateConnectionParams,
  isReconnect: boolean = false
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const host = params.host
    if (CONNECTION === null || isReconnect) {

      /** Creates connection */
      CONNECTION 
        = mysql.createConnection(
          params
        ) as MySqlDatabaseConnection

      CONNECTION.connect((error) => {
        if (error) {
          reject(new MySqlConnectionError({
            message: 'unable to establish new mysql connection',
            data: {host: params.host}
          }))
          return
        }
        AppLogger.info(`MySqlClient connected`);
        resolve();
      });

      CONNECTION.on('error', async (error) => {
        AppLogger.error({
          severity: 3,
          message: 'failed to establish connection with mysql database',
          data: error
        })
        AppLogger.info(
          `attempting to re-establish connection with the remote database`
        )
        if (CONNECTION === null) return
        CONNECTION.end()
        await establishNewConnection(params, true)
          .then()
          .catch((error) => {
            reject(new FatalMySqlConnectionError({
              message: 'fatal error unable to reconnect back to mysql database',
              data: error
            }))
          })
      })
      return
    }
    resolve();
  });
};

/**
 * Hostname-based parameters for establishing MySQL connections.
 */
let hostnameParams: MySqlCreateConnectionParams | null = null

export class MySqlClient implements DatabaseProviderInterface {
  connection: () => MySqlDatabaseConnection
  params: MySqlCreateConnectionParams
  connect(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const hostname = AppENV.get('MYSQL_HOST_NAME')
      if (hostnameParams === null) {
        const params: MySqlCreateConnectionParams = {
          host: hostname,
          user: AppENV.get('MYSQL_USERNAME'),
          password: AppENV.get('MYSQL_PASSWORD'),
          database: AppENV.get('MYSQL_DATABASE'),
        };
        if (AppENV.get('MYSQL_USE_SSL') === 'true') {
          const certificatePath = `${Application.root()}/mysql.crt.pem`
          params.ssl = { ca: fs.readFileSync(certificatePath) }
        }
        hostnameParams = params;
      }
      this.params = hostnameParams
      await establishNewConnection(hostnameParams)
      this.connection = () => {
        if (CONNECTION === null) {
          /** Should not happen */
          throw new Error()
        }
        return CONNECTION
      }
      resolve(true)
      return
    })
  }
  /**
   * @NOTE This is not a re-attempt to submit the query. 
   * This will only try recover or re-establish the connection 
   * based on certain errors.
   */
  private recover(error: Error){
    if (error.message === 'Cannot enqueue Query after fatal error.') {
      AppLogger.info(
        'attempting to re-establish new connection after '
        + 'cannot enqueue query after fatal error'
      )
      establishNewConnection(this.params, true)
    }
  }

  create(): DatabaseCreateOptions {
    return {
      collection: (query: string | null) => {
        throw new LogicException({
          message: 'mysql client create collection not implemented',
          data: {query: query}
        })
      },
      entity:(collection, entity) => {
        const insertstmt = MySqlCommandHelper.generate.insert(collection, entity)
        if (Array.isArray(insertstmt.data)) {
          throw new LogicException({
            message: 'mysql helper insert should not return data in array type',
            data: { data: insertstmt.data }
          })
        }
        return {
          query: insertstmt.query,
          data: insertstmt.data
        }
      }
    };
  }

  update(): DatabaseUpdateOptions {
    return {
      entity:(collection, data) => {
        return MySqlCommandHelper.generate.update(collection, data) as DatabaseSingleTransaction
      }
    }
  }

  get(): DatabaseGetOptions {
    return {
      entity: (collection: string, entityId: Entity.Id) => {
        return new Promise((resolve, reject) => {
          /**
           * @TODO Need to convert this query to mysql with ?
           */
          const query = "SELECT * FROM ?? WHERE entity_id = ?"
          this.connection().query(query, [collection, entityId], (error, results, fields) => {
            if (error) {
              this.recover(error)
              return reject(new GenericMySqlException({
                message: 'failed to make mysql get entity query',
                data: {
                  query: query,
                  entity_id: entityId,
                  error: error
                }
              }));
            }
            if (results.length === 0) return resolve([])
            resolve(results)
          })
        })
      },
      entities: (collection, entityIds) => {
        return new Promise(async (resolve, reject) => {
          try {
            const query = 'SELECT * FROM ?? IN (?)'
            this.connection().query(query, [collection, entityIds], (error, results, fields) => {
              if (error) {
                this.recover(error)
                return reject(new GenericMySqlException({
                  message: 'failed to make mysql get entities query',
                  data: {
                    query: query,
                    collection: collection,
                    entity_id: entityIds,
                    error: error
                  }
                }));
              }
              if (results.length === 0) return resolve([])
              resolve(results)
            });
          } catch (error) {
            reject(error)
          }
        })
      },
      list: (collection, listName, value, limit) => {
        return new Promise((resolve, reject) => {
          let limitClause = "";
          if (
            limit !== undefined &&
            limit !== null &&
            typeof limit === "number"
          ) {
            limitClause = " LIMIT " + limit + ";";
          }
          const query = `SELECT entity_id FROM ?? WHERE ${listName} = ? ${limitClause}`
          this.connection().query(query,[collection, value], (error, results, fields) => {
            if (error) {
              this.recover(error)
              return reject(new GenericMySqlException({
                message: 'failed to make mysql get list query',
                data: {
                  query: query,
                  list: listName,
                  value: value,
                  error: error
                }
              }));
            }
            resolve(results)
          });
        });
      },
      byPrimaryId: (collection, primaryId) => {
        return new Promise((resolve, reject) => {
          const query =  `SELECT * FROM ?? WHERE id = ?`
          this.connection().query(query, [collection, primaryId], (error, results, fields) => {
            if (error) {
              this.recover(error)
              return reject(new GenericMySqlException({
                message: 'failed to make mysql get entity by primary id query',
                data: {
                  query: query,
                  collection: collection,
                  primary_id: primaryId,
                  error: error
                }
              }));
            }
            if (results.length === 0) return resolve([])
            resolve(results)
          })
        })
      }
    }
  }

  whereField(collection: string, fieldName: string): DatabaseWhereFieldOptions {
    return {
      hasValue: (fieldValue) => {
        return new Promise(async (resolve, reject)=>{
          const handler = (error, results) => {
            if (error) {
              this.recover(error)
              return reject(new GenericMySqlException({
                message: 'failed to make mysql get entity by field query',
                data: {
                  query: query,
                  collection: collection,
                  fieldName: fieldName,
                  fieldValue: fieldValue,
                  error: error
                }
              }));
            }
            resolve(results);
          }
          const query = `SELECT * FROM ?? WHERE ${fieldName} = ?`
          this.connection().query(query, [collection, fieldValue], handler)
        })
      }
    }
  }

  query(singleOp: MySqlSingleQuery): Promise<object[]> {
    return new Promise((resolve, reject) => {
      this.connection().query(
        singleOp.query,
        singleOp.data as Array<string>,
        (error, results, fields) => {
          if (error) {
            this.recover(error)
            return reject(new GenericMySqlException({
              message: 'failed to make mysql query',
              data: {
                query: singleOp.query,
                data: singleOp.data,
                error: error
              }
            }));
          }
          resolve(results);
        }
      );
    });
  }

  beginTransaction(batchOpts: Array<DatabaseSingleTransaction>): Promise<null> {
    const transact = (singleOp: MySqlSingleQuery): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        this.connection().query(
          singleOp.query,
          singleOp.data as Array<string>,
          (error, results, fields) => {
            if (error) {
              AppLogger.error({
                severity: 3,
                message: 'mysql transaction failed',
                data: {
                  query: singleOp.query,
                  data: singleOp.data,
                  error: error
                }
              })
              this.connection().rollback(function (error) {
                AppLogger.error({
                  severity: 1,
                  message: 'mysql transaction rollback failed',
                  data: {
                    query: singleOp.query,
                    data: singleOp.data,
                    error: error
                  }
                })
              });
              resolve(false)
              return
            }
            resolve(true)
          }
        )
      })
    }

    return new Promise((resolve, reject) => {
      this.connection().beginTransaction(async (error) => {
        if (error) {
          return reject(new FatalMySqlConnectionError({
            message: 'unable to begin mysql transaction',
            data: {
              batchOpts: batchOpts,
              error: error
            }
          }))
        }
        let hasError = false;
        for (let index = 0; index < batchOpts.length; index++) {
          const singleOp = batchOpts[index];
          const successful = await transact(singleOp);
          hasError = !successful;
          if (hasError) break;
        }
        if (!hasError) {
          this.connection().commit((error) => {
            if (error) {
              AppLogger.error({
                severity: 1,
                message: 'mysql transaction commit failed',
                data: {
                  batchOpts: batchOpts,
                  error: error
                }
              })
              this.connection().rollback(reject);
              hasError = true;
            }
            resolve(null)
          })
          return
        }
        return reject(new GenericMySqlException({
          message: 'mysql transactions failed due to error',
          data: {
            batchOpts: batchOpts
          }
        }));
      });
    });
  }
}
