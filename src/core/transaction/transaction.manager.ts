import { Application } from "../application";
import { AbstractDatabaseProvider, DatabaseTransactionStep } from "../providers/database/database.provider";

export class TransactionManager {

  private transactionSteps: Array<DatabaseTransactionStep>
  private databaseProvider: AbstractDatabaseProvider

  constructor(){
    this.transactionSteps = []
    this.databaseProvider = Application.container().get(AbstractDatabaseProvider)
  }

  stage(transactionStep: DatabaseTransactionStep){
    this.transactionSteps.push(transactionStep)
  }

  async commit(){
    return await this.databaseProvider.beginTransaction(this.transactionSteps)
  }

}