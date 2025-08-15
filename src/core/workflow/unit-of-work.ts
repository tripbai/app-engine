import {
  AbstractDatabaseProvider,
  DatabaseTransactionStep,
} from "../providers/database/database.provider";

/**
 * Unit of Work pattern implementation.
 * The unit of work is a design pattern that allows you to group multiple operations into a single transaction.
 */
export class UnitOfWork {
  /**
   * The transaction steps that will be executed in the unit of work.
   */
  private transactionSteps: Array<DatabaseTransactionStep>;

  constructor(private abstractDatabaseProvider: AbstractDatabaseProvider) {
    this.transactionSteps = [];
  }

  /**
   * Adds a transaction step to the unit of work.
   * @param transaction
   */
  addTransactionStep(transaction: DatabaseTransactionStep) {
    this.transactionSteps.push(transaction);
  }

  /**
   * Commits the transaction steps in the unit of work.
   * This method groups the transaction steps by their executor and calls the `beginTransaction` method on each executor with the grouped steps.
   * @returns
   */
  async commit() {
    const grouped = new Map<
      AbstractDatabaseProvider,
      DatabaseTransactionStep[]
    >();
    for (const step of this.transactionSteps) {
      if (!grouped.has(step.executor)) {
        grouped.set(step.executor, []);
      }
      grouped.get(step.executor)!.push(step);
    }
    // Execute beginTransaction for each executor group
    for (const [executor, steps] of grouped.entries()) {
      await executor.beginTransaction(steps);
    }
    this.transactionSteps = []; // Clear the transaction steps after committing
    return;
  }
}
