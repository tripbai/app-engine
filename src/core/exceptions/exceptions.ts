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

export class BadRequestException extends Error {
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

export class BadInputException extends Error {
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

export class RecordAlreadyExistsException extends Error {
  code: number;
  constructor({
    message,
    data,
  }: {
    message: string;
    data: Record<string, any>;
  }) {
    super(message);
    logError({ severity: 5, message: message, data: data });
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 409;
  }
}

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

export class ExternalApiException extends Error {
  code: number;
  constructor(params: {
    message: string;
    statusCode: number;
    data: Record<string, any>;
  }) {
    super(params.message);
    logError({ severity: 3, message: params.message, data: params.data });
    this.message = params.message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = params.statusCode;
  }
}

export class GenericServiceProviderException extends Error {
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
    this.code = 10001;
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
