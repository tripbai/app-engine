const jwt = require('jsonwebtoken')
import { ToUnknownKeys } from '../interface'
import { AppENV } from './env';

/**
 * Namespace providing helper functions for JWT generation and parsing.
 */
export namespace JwtHelper {

  /**
   * The parsed payload structure for a JWT, containing issuer, audience, and data.
   *
   * @template T - Generic payload type with key-value pairs.
   */
  type ParsedPayload<T extends { [key: string]: any }> = { 
    iss: string, 
    aud: string,  
    data: ToUnknownKeys<T> 
  };

  /**
   * Parameters for generating a JWT token.
   *
   * @template TDataPayload - Type of the payload data.
   * @property {string} secret - The secret key used to sign the JWT.
   * @property {number} untilMinutes - The token expiration time in minutes.
   * @property {TDataPayload} data - The payload data to include in the token.
   * @property {string} issuer - The issuer of the token.
   * @property {string} audience - The audience for which the token is intended.
   */
  export type TokenParams<TDataPayload> = {
    secret: string;
    untilMinutes: number;
    data: TDataPayload;
    issuer: string;
    audience: string;
  };

  /**
   * Generates a signed JWT token based on the provided parameters.
   *
   * @template T - Payload type containing a key-value structure.
   * @param {TokenParams<T['payload']>} param - Parameters required for JWT generation.
   * @returns {string} - The generated JWT token.
   */
  export const generate = <T extends { payload: { [key: string]: any } }>(param: TokenParams<T['payload']>) => {
    const expiration = Math.floor(Date.now() / 1000) + (60 * param.untilMinutes);
    const options = {issuer: param.issuer, audience: param.audience};
    return jwt.sign(
      {data: param.data, exp: expiration},
      param.secret,
      options
    );
  };

  /**
   * Parses a JWT token and verifies it against the tenant's secret.
   * If verification fails, throws a `ResourceAccessForbiddenException`.
   *
   * @template T - Payload type containing key-value pairs.
   * @param {string} token - The JWT token to parse and verify.
   * @returns {ParsedPayload<T>} - The parsed payload of the JWT.
   */
  export const parse = <T extends { [key: string]: any }>(token: string): ParsedPayload<T> => {
    try {
      let parsed: ParsedPayload<T>
        = jwt.verify(token, AppENV.get('JWT_SECRET'))
      return parsed
    } catch (error) {
      throw new Error(error.message)
    }
  };
}
