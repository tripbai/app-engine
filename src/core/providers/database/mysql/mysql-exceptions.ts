import { logError } from "../../../application/appLogger";

export class MySqlConnectionError extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    logError({ severity: 3, message: message, data: data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 10001;
  }
}

export class FatalMySqlConnectionError extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    logError({ severity: 1, message: message, data: data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 10001;
  }
}

export class GenericMySqlException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    logError({ severity: 3, message: message, data: data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 10001;
  }
}
