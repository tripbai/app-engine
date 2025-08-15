export abstract class AbstractEventManagerProvider {
  /**
   * Registers an event listener for the specified event.
   * @param EventInterface The event object implementing EventInterface.
   * @param handler The handler function to be called when the event is emitted.
   */
  abstract listen<T extends EventInterface>(
    EventInterface: T,
    handler: T["handler"]
  ): void;

  /**
   * Dispatches an event with retries if it fails, ensuring the next listener does not wait.
   * @param EventInterface The event object implementing EventInterface.
   * @param data The data to be passed to the event handler.
   * @returns A promise that resolves when the event is dispatched.
   */
  abstract dispatch<T extends EventInterface>(
    EventInterface: T,
    ...data: GetArguments<T["handler"]>
  ): Promise<void>;
}

export interface EventInterface {
  /**
   * Returns the id of the event.
   * @returns The id of the event as a string.
   */
  id: () => string;
  /**
   * The handler function to be called when the event is triggered.
   * @param args The arguments to be passed to the handler function.
   */
  handler: (...args: any[]) => Promise<void>;
}

/**
 * Helper type to extract arguments from a function type.
 */
export type GetArguments<T> = T extends (...args: infer A) => any ? A : never;

export type EventListenerInterface<T extends EventInterface> = {
  execute: T["handler"];
};
