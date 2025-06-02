import { AppLogger } from "../../../helpers/logger"


let generic = `Request failed to complete due to error encountered `
    generic += `by one of your database service providers `

export class MySqlConnectionError extends Error {
  code: number
  constructor(params: {message: string, data: Record<string,any>}) {
    super(generic)
    AppLogger.error(
      { severity: 3, message: params.message, data: params.data }
    )
    this.message = generic
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}

export class FatalMySqlConnectionError extends Error {
  code: number
  constructor(params: {message: string, data: Record<string,any>}) {
    super(generic)
    AppLogger.error(
      { severity: 1, message: params.message, data: params.data }
    )
    this.message = generic
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}

export class GenericMySqlException extends Error {
  code: number
  constructor(params: {message: string, data: Record<string,any>}) {
    super(generic)
    AppLogger.error(
      { severity: 3, message: params.message, data: params.data }
    )
    this.message = generic
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}