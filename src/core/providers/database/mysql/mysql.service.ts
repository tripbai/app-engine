import { inject, injectable } from "inversify";
import { MySqlTransactionHelper } from "./mysql-transaction.helper";
import { MySqlPoolService } from "../../../services/mysql/mysql-pool-service";
import { AbstractMySqlPoolService } from "../../../services/mysql/mysql-pool-service.interface";
import { DatabaseTransactionStep, FlatDatabaseRecord } from "../database.provider";
import { LogicException } from "../../../exceptions/exceptions";
import { MySqlTransactionStep } from "./mysql.service.d";
import { FatalMySqlConnectionError, GenericMySqlException } from "./mysql-exceptions";
import { MySqlPool, MySqlPoolConnection } from "../../../services/mysql/mysql";
import { AppLogger } from "../../../helpers/logger";

@injectable()
export class MySqlService {

  constructor(
    @inject(MySqlTransactionHelper) public readonly MySqlTransactionHelper: MySqlTransactionHelper,
    @inject(MySqlPoolService) public readonly MySqlPoolService: AbstractMySqlPoolService
  ){}

  async connect(): Promise<boolean> {
    await this.MySqlPoolService.createOrGetPool()
    return true
  }

  createRecord(
    collection: string,
    record: FlatDatabaseRecord
  ): Readonly<DatabaseTransactionStep> {

    const insertTransactionStep = this.MySqlTransactionHelper.generateInsertTransactionStep(collection, record)

    /** Shouldn't be used for multiple inserts */
    if (Array.isArray(insertTransactionStep.data)) {
      throw new LogicException({
        message: 'mysql insert transaction step should not return data in array type',
        data: { data: insertTransactionStep.data }
      })
    }

    return insertTransactionStep as DatabaseTransactionStep

  }

  private executeTransactionStep(
    poolConnection: MySqlPoolConnection,
    transactionStep: MySqlTransactionStep
  ): Promise<{has_error: boolean}> {
    return new Promise((resolve, reject) => {
      poolConnection.query(transactionStep.query, transactionStep.data, (error, results, fields) => {
        if (error) {
          AppLogger.error({
            severity: 3,
            message: 'mysql transaction step failed',
            data: { query: transactionStep.query, data: transactionStep.data, error: error }
          })
          resolve({has_error: true})
          return
        }
        resolve({has_error: false})
      })
    })
  }

  private async executeTransaction(transactionSteps: Array<Readonly<DatabaseTransactionStep>>): Promise<void> {

    /** First, we'll retrieve connection from the Pool */
    const Pool = await this.MySqlPoolService.createOrGetPool()

    const connection = await new Promise<MySqlPoolConnection>((resolve, reject) => {
      Pool.getConnection((error, connection) => {
        if (error) {
          reject(new FatalMySqlConnectionError({
            message: 'failed to get mysql connection from pool',
            data: { error }
          }))
          return
        }
        resolve(connection)
      })
    })

    try {

      /** Waits for the connection to create a new transaction */
      await new Promise<void>((resolve, reject) => {
        connection.beginTransaction(error => {
          if (error) {
            reject(new FatalMySqlConnectionError({
              message: 'unable to begin mysql transaction',
              data: { transaction_steps: transactionSteps, error: error }
            }))
          }
        })
      })


      for (let index = 0; index < transactionSteps.length; index++) {
        const singleOp = transactionSteps[index]
        const {has_error} = await this.executeTransactionStep(connection, singleOp)
        if (has_error) {
          throw new FatalMySqlConnectionError({
            message: `mysql transaction step failed at index ${index}`,
            data: { transaction_steps: transactionSteps }
          })
        }
      }

      await new Promise<void>((resolve, reject) => {
        connection.commit((error) => {
          if (error) {
            reject(new FatalMySqlConnectionError({
              message: 'mysql transaction commit failed',
              data: { transaction_steps: transactionSteps, error: error }
            }))
            return
          }
          resolve()
        })
      })

    } catch (error) {
      try {
        await new Promise<void>((res, rej) => connection.rollback(() => res()))
      } catch (rollbackError) {
        AppLogger.error({
          severity: 2,
          message: 'mysql rollback failed',
          data: { rollbackError }
        })
      }
      throw error
    } finally {
      connection.release()
    }

  }

  async beginTransaction(transactionSteps: Array<Readonly<DatabaseTransactionStep>>, options?: { maxRetries?: number; retryDelayMs?: number }): Promise<void> {

    if (transactionSteps.length === 0) {
      return
    }

    const maxRetries = options?.maxRetries ?? 3
    const retryDelayMs = options?.retryDelayMs ?? 200

    let attempt = 0

    while (attempt <= maxRetries) {
      try {
        await this.executeTransaction(transactionSteps)
        return /** Transaction steps were executed successfully without issues */
      } catch (error: any) {
        const isDeadlock =
          error?.code === 'ER_LOCK_DEADLOCK' || error?.errno === 1213

        if (isDeadlock && attempt < maxRetries) {
          AppLogger.error({
            severity: 3,
            message: `Deadlock detected, retrying transaction (attempt ${attempt + 1})...`,
            data: {error}
          })
          attempt++
          /** Delay for about retryDelayMs ms, then proceed to the next attempt */
          const jitter = Math.floor(Math.random() * 100)
          await new Promise((res) => setTimeout(res, retryDelayMs + jitter))
          continue
        }

        /** When maximum retries are exhausted */
        throw new FatalMySqlConnectionError({
          message: 'failed to complete mysql transaction after retries',
          data: {max_retries: maxRetries, retry_delay_ms: retryDelayMs, error: error}
        })
      }
    }

  }

}