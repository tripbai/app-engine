import { EventInterface } from "../events/event.interface";
import { AbstractDatabaseProvider, DatabaseTransactionStep } from "../providers/database/database.provider";

export class UnitOfWork {

  private transactionSteps: Array<DatabaseTransactionStep>
  private deferredEvents: Array<EventInterface>

  constructor(
    public readonly abstractDatabaseProvider: AbstractDatabaseProvider
  ){
    this.transactionSteps = []
    this.deferredEvents   = []
  }

  addTransactionStep(transaction: DatabaseTransactionStep){
    this.transactionSteps.push(transaction)
  }

  scheduleEvent(event: EventInterface){
    this.deferredEvents.push(event)
  }

  async commit(){
    return await this.abstractDatabaseProvider.beginTransaction(this.transactionSteps)
  }

}