import { injectable } from "inversify";
import { AbstractNodeEmitterConfig } from "./node-emitter-config.interface";
import { getEnv } from "../../../application/appEnv";

@injectable()
export class NodeEmitterEnvConfig implements AbstractNodeEmitterConfig {
  /**
   * Get the maximum number of retries for event processing.
   * @returns
   */
  getMaxRetries(): number {
    return parseInt(getEnv("NODE_EMITTER_EVENT_MAX_RETRIES"));
  }

  /**
   *
   * @returns
   */
  isAsynchronous(): boolean {
    return getEnv("NODE_EMITTER_RUN_ASYNC").toString() === "true";
  }
}
