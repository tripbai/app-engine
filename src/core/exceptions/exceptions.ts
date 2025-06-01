import { Application } from "../application";
import { Core } from "../module/module";
import { AppLogger } from "../helpers/logger";

interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void;
}

export class DataIntegrityException extends Error {
  code: number
  constructor(params: {message: string, data: Record<string,any>}) {
    let generic = `Request failed due to complete due to unexpected or invalid data `
    generic += `retrieved from an internal source. Please contact your provider for `
    generic += `more information.`
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: 1, message: params.message, data: params.data }
    )
    this.message = message
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}

export class JSONParsingError extends Error {
  code: number;
  constructor(params: {severity: number, message: string, data: Record<string,any>}) {
    let generic = `Parsing of string to JSON resulted to an error. Please refer to `;
    generic += `your provider's documentation for more information.`;
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(params)
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}

export class LogicException extends Error {
  code: number
  constructor(params: {message: string, data: Record<string,any>}) {
    let generic = `Request failed to complete due to a logic error that occured `
    generic += `within the application. Please notify your provider for more `
    generic += `information.`
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: 1, message: params.message, data: params.data }
    )
    this.message = message
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}

export class BadRequestException extends Error {
  code: number;
  constructor(params: {message: string, data: Record<string,any>}) {
    let generic = `We are unable to process your request due to missing information `;
    generic += `or invalid syntax in the request. Please refer to your provider's `;
    generic += `documentation for more information.`;
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: 5, message: params.message, data: params.data }
    )
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 400;
  }
}

export class RecordNotFoundException extends Error {
  code: number
  constructor(params: {message: string, data: Record<string,any>}) {
    let generic = `Request failed to complete due to required set of data that `
    generic += `is not found. Please refer to your provider's documentation `
    generic += `for more information. `
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: 5, message: params.message, data: params.data }
    )
    this.message = message
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 404
  }
}

export class ResourceAccessForbiddenException extends Error {
  code: number;
  constructor(params: {message: string, data: Record<string,any>}) {
    let generic = `You do not have the neccessary permissions to access this resource. `;
    generic += `Please refer to  your provider's documentation for more information.`;
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: 5, message: params.message, data: params.data }
    )
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 403;
  }
}

export class UnauthorizedAccessException extends Error {
  code: number;
  id: string
  constructor(params: {message: string, data: Record<string,any>}) {
    let generic = `Your credentials are not valid to be able to proceed with the request. `;
    generic += `Please refer to your provider's documentation for more information.`;
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: 5, message: params.message, data: params.data }
    )
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 401;
  }
}

export class RecordAlreadyExistsException extends Error {
  code: number;
  constructor(params: {message: string, data: Record<string,any>}) {
    let generic = `The record you are trying to create already exists in the system. `;
    generic += `Please check your input or try updating the existing record. `;
    generic += `Please refer to  your provider's documentation for more information.`;
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: 5, message: params.message, data: params.data }
    )
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 409;
  }
}

export class ExternalApiException extends Error {
  code: number
  constructor(params: {message: string, statusCode: number, data: Record<string,any>}) {
    let generic = `The request could not be completed due to an error response from the external API endpoint`
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: 3, message: params.message, data: params.data }
    )
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = params.statusCode;
  }
}

export class GenericServiceProviderException extends Error {
  code: number;
  id: string
  constructor(params: {severity: number, message: string, data: Record<string,any>}) {
    let generic = `This exception was thrown due to an issue encountered by one of your `;
    generic += `service providers. Please refer to your application logs for more information.`;
    const message = Application.environment() === 'test' ? params.message : generic
    super(message)
    AppLogger.error(
      { severity: params.severity, message: params.message, data: params.data }
    )
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 500;
  }
}

export class ArchivedRecordException extends Error {
  code: number;
  id: string
  constructor(entityId: Core.Entity.Id) {
    let generic = `This record you are trying to access has already been archived or deleted.`;
    super(generic)
    AppLogger.error(
      { severity: 5, message: 'accessing archived record', data: {entity_id: entityId} }
    )
    this.message = generic;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = 409;
  }
}