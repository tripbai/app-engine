import { Application } from "../../application"
import { AppLogger } from "../../helpers/logger"

export class OverridingLockedActionException extends Error {
  code: number
  constructor(data: {
    attemptedAction: string
    lockedAction: string | null
    data: {[key:string]: any}
  }) {
    const generic = `Attempts to do another action when it is locked to a certain state`
    super(generic)
    AppLogger.error(
      { severity: 1, message: generic, data: data }
    )
    this.message = generic
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}

export class OverridingReservedFieldsException extends Error {
  code: number
  constructor(data: {[key:string]: any}) {
    const generic = `Attempts to override reserved entity fields`
    super(generic)
    AppLogger.error(
    { severity: 1, message: generic, data: data }
    )
    this.message = generic
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}

export class UpdatingUninitializedDataException extends Error {
  code: number
  constructor(data: {[key:string]: any}) {
    const generic = `Attempts to update data that has not been initialized yet`
    super(generic)
    AppLogger.error(
    { severity: 1, message: generic, data: data }
    )
    this.message = generic
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 500
  }
}