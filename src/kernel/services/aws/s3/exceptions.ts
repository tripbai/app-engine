import { AppLogger } from "../../../helpers/logger"

export class GenericAWS3Exception extends Error {
  code: number
  constructor(params: {message: string, data: Record<string,any>}) {
    let generic = `Request failed to complete due to a logic error that occured `
    generic += `within the application. Please notify your provider for more `
    generic += `information.`
    super(generic)
    AppLogger.error(
      {  severity: 3, message: params.message, data: params.data }
    )
    this.message = generic
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}