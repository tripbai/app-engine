import { logError } from "../../application/appLogger";

export class OverridingLockedActionException extends Error {
  code: number;
  constructor(data: {
    attemptedAction: string;
    lockedAction: string | null;
    data: { [key: string]: any };
  }) {
    const message = `Attempts to do another action when it is locked to a certain state`;
    super(message);
    logError({ severity: 1, message: message, data: data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}

export class OverridingReservedFieldsException extends Error {
  code: number;
  constructor(data: { [key: string]: any }) {
    const message = `Attempts to override reserved entity fields`;
    super(message);
    logError({ severity: 1, message: message, data: data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}

export class UpdatingUninitializedDataException extends Error {
  code: number;
  constructor(data: { [key: string]: any }) {
    const message = `Attempts to update data that has not been initialized yet`;
    super(message);
    logError({ severity: 1, message: message, data: data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}
