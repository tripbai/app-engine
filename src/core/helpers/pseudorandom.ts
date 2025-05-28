const crypto = require('crypto')

/** Pseudorandom alphanumeric string generators.*/
export namespace Pseudorandom {
  /**
   * Generates a 32-character alphanumeric pseudorandom string.
   * @returns {string & { length: 32 }} - A pseudorandom alphanumeric string of 32 characters.
   */
  export const alphanum32 = (): string & { length: 32 } => {
    return crypto.randomUUID().split('-').join('')
  };

  /**
   * Generates a 64-character alphanumeric pseudorandom string by concatenating two UUIDs.
   * @returns {string} - A pseudorandom alphanumeric string of 64 characters.
   */
  export const alphanum64 = (): string => {
    const left  = alphanum32()
    const right = alphanum32()
    return left + right
  }
}
