export abstract class AbstractNodeEmitterConfig {
  abstract getMaxRetries(): number;

  abstract isAsynchronous(): boolean;
}
