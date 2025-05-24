import { LogicException } from "../exceptions/exceptions"
import { AppLogger } from "./logger"

const _env: {[key:string]:any} = {}
export namespace AppENV {
  /**
   * Returns environment variables defined
   * @param key - key of the environment variable
   * @returns string
   */
  export const get = (
    key: string,
  ): string => {
    if (_env[key] === undefined) {
      throw new LogicException({
        message: 'application envar must be provided before used',
        data: {key: key}
      })
    }
    return _env[key]
  }

  /**
   * Sets environment variable value
   * @param key - key of the environment variable
   * @param value - value of the environment variable
   * @returns string
   */
  export const set = (
    key: string,
    value: string
  ): void => {
    if (_env[key] !== undefined) {
      throw new LogicException({
        message: 'application envar can only be assigned once',
        data: {key: key}
      })
    }
    _env[key] = value
  }
}