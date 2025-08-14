import { logError } from "../application/appLogger";
import * as Core from "../module/types";

interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void;
}

export class DataIntegrityException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    const severity = 1;
    logError({ severity, message, data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}

export class JSONParsingError extends Error {
  code: number;
  constructor({
    severity,
    message,
    data,
  }: {
    severity: number;
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    logError({ severity, message, data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}

export class InvalidArgumentException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    const severity = 5;
    logError({ severity, message, data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 400;
  }
}

export class RecordNotFoundException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    const severity = 5;
    logError({ severity, message, data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 404;
  }
}

export class UnauthorizedAccessException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    const severity = 5;
    logError({ severity, message, data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 401;
  }
}

export class RecordAlreadyExistsException extends Error {}

export class ResourceAccessForbiddenException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    const severity = 5;
    logError({ severity, message, data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 403;
  }
}

export class LogicException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    // logic exceptions are treated with high severity
    const severity = 1;
    logError({ severity, message, data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}

export class ArchivedRecordException extends Error {
  code: number;
  constructor(entityId: Core.Entity.Id) {
    let generic = `This record you are trying to access has already been archived or deleted.`;
    super(generic);
    logError({
      severity: 5,
      message: "accessing archived record",
      data: { entity_id: entityId },
    });
    this.message = generic;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 409;
  }
}
