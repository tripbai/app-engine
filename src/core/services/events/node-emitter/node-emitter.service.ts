import Events = require("events");
import { inject, injectable } from "inversify";
import { AbstractNodeEmitterConfig } from "./node-emitter-config.interface";
import { logError } from "../../../application/appLogger";
const emitter = new Events.EventEmitter();

/**
 * A simple event manager built on top of node emitter.
 * It allows for both synchronous and asynchronous event handling.
 * Event emission in AWS Lambda functions should be awaited or handled synchronously if you want to ensure all logic (including all event handlers) completes before the Lambda function exits.
 * This is because AWS Lambda does not wait for asynchronous operations (like setTimeout, promises not awaited, or events emitted with no listeners awaited) to finish unless they are part of the main execution path (i.e. awaited or returned).
 * If you emit an event and do not await it, the Lambda function may terminate before the event handlers have a chance to execute, leading to unexpected behavior or missed events.
 */
@injectable()
export class NodeEmitterService {
  constructor(
    @inject(AbstractNodeEmitterConfig)
    private abstractNodeEmitterConfig: AbstractNodeEmitterConfig
  ) {}

  listen(eventId: string, handler: (...args: any[]) => void) {
    emitter.on(eventId, handler);
  }

  async dispatch(eventId: string, ...data: any): Promise<void> {
    const listeners = emitter.listeners(eventId);
    for (const listener of listeners) {
      if (this.abstractNodeEmitterConfig.isAsynchronous()) {
        this.emitWithRetry(eventId, listener, data);
      } else {
        await this.emitWithRetry(eventId, listener, data);
      }
    }
    return;
  }

  /**
   * Emits an event with retry logic.
   * @param listener The event handler function.
   * @param data The event data.
   */
  private async emitWithRetry(
    id: string,
    listener: Function,
    data: unknown[],
    attempts = 0
  ): Promise<void> {
    try {
      await listener(...data);
    } catch (error: unknown) {
      logError({
        severity: 1,
        message: `event handler failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: { eventId: id, error: error },
      });
      if (attempts < this.abstractNodeEmitterConfig.getMaxRetries()) {
        setTimeout(
          () => this.emitWithRetry(id, listener, data, attempts + 1),
          1000
        );
      } else {
        let message = "event handler failed after max retries";
        logError({
          severity: 1,
          message: message,
          data: { eventId: id, error: error },
        });
      }
    }
  }
}
