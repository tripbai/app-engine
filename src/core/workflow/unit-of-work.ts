import { AbstractDatabaseProvider, DatabaseTransactionStep } from "../providers/database/database.provider";

/**
 * Unit of Work pattern implementation. 
 * The unit of work is a design pattern that allows you to group multiple operations into a single transaction.
 */
export class UnitOfWork {

  /**
   * The transaction steps that will be executed in the unit of work.
   */
  private transactionSteps: Array<DatabaseTransactionStep>

  constructor(
    public readonly abstractDatabaseProvider: AbstractDatabaseProvider
  ){
    this.transactionSteps = []
  }

  /**
   * Adds a transaction step to the unit of work.
   * @param transaction 
   */
  addTransactionStep(transaction: DatabaseTransactionStep){
    this.transactionSteps.push(transaction)
  }

  /**
   * Commits the transaction steps in the unit of work.
   * @returns 
   */
  async commit(){
    return await this.abstractDatabaseProvider.beginTransaction(this.transactionSteps)
  }

}