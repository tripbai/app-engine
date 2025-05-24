import * as fs from 'fs'
import { LogicException } from "../exceptions/exceptions"
import { AppLogger } from './logger'

export type ToNullOrUndefined<T> = {
  [K in keyof T]: T[K] | null | undefined;
}

/**
 * Provides utilities for accessing and managing vault-stored data. 
 * The vault is assumed to contain application-specific data files accessible through defined paths.
 * Includes methods to retrieve data from specified vault paths, check the vault's root directory, 
 * and manage request-response mappings for pulling data from remote endpoints.
 */
export namespace Vaulter {

  /**
   * Retrieves data from a specified vault path, parsing the content as JSON.
   * The path is resolved relative to the application's root directory, with the
   * result including null or undefined values as permitted types for each property.
   *
   * @template T - The expected structure of the JSON data being retrieved.
   * Must be a Record with string keys and values that are strings, booleans, numbers, 
   * nested objects, or null.
   * 
   * @param {string} path - The relative path within the vault to the data file.
   * @returns {ToNullOrUndefined<T>} The parsed data object with properties that can be
   * null or undefined, based on the specified type `T`.
   * @throws {InvalidArgumentException} If the application root directory is not set.
   * @throws {LogicException} If the specified file path does not exist.
   */
  export const getData = <T extends Record<string,string|boolean|number|{[key:string]:any}|null>>(path: string):ToNullOrUndefined<T> => {
    const root = Application.root()
    if (root === null) {
      throw new LogicException({
        message: 'application may have started without setting the root path directory',
        data: {}
      })
    }
    const filePath = root+'/vault/'+path
    if (!fs.existsSync(filePath)) {
      throw new VaultFileNotFoundException(filePath)
    }
    const content = fs.readFileSync(filePath).toString()
    return JSON.parse(content)
  }

  /**
   * Returns the directory path of the vault, relative to the application's root directory.
   * Useful for checking or retrieving the vault's location for storage or organizational purposes.
   *
   * @returns {string} The full path to the vault directory.
   * @throws {InvalidArgumentException} If the application root directory is not set.
   */
  export const getDir = () => {
    const root = Application.root()
    if (root===null) {
      throw new LogicException({
        message: 'application may have started without setting the root path directory',
        data: {}
      })
    }
    return root+'/vault'
  }
}

/**
 * Class `VaultFileNotFoundException` provides a structured error for handling cases 
 * where a requested vault file does not exist.
 **/
export class VaultFileNotFoundException extends Error {
  code: number
  constructor(path: string) {
    let generic = `Request failed to complete due to required set of data that `
    generic += `is not found. Please refer to your provider's documentation `
    generic += `for more information. `
    super(generic)
    AppLogger.error({ 
      severity: 1, 
      message: 'attempt to retrieve a file in vault that does not exist', 
      data: {file_path: path}
    })
    this.message = generic
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 404
  }
}