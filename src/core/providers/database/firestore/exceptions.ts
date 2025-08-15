import { logError } from "../../../application/appLogger";

let generic = `Request failed to complete due to error encountered `;
generic += `by one of your database service providers `;

export class GenericFirestoreException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    logError({
      severity: 2,
      message: message,
      data: data,
    });
    this.message = generic;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 10001;
  }
}

export class FatalFirestoreConnectionError extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    logError({
      severity: 1,
      message: message,
      data: data,
    });
    this.message = generic;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 10001;
  }
}
