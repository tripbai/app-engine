import { logError } from "../../../application/appLogger";

export class GenericAWS3Exception extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    logError({ severity: 3, message, data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}
