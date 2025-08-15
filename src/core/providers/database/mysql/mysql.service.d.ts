import {
  AbstractDatabaseProvider,
  FlatDatabaseRecord,
} from "../database.provider";

/**
 * Overrides the DatabaseTransactionStep
 */
export type MySqlTransactionStep = {
  /**
   * The object or service, which implements this interface, that will execute the step.
   */
  executor: AbstractDatabaseProvider;

  /**
   * The type of step
   */
  type: "create" | "read" | "update" | "delete";

  /** The query string to be used for a single operation */
  query: string;

  /** The data that populates the placeholders in the array */
  data: FlatDatabaseRecord | Array<string | number | boolean | null>;
};
