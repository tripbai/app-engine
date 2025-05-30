
export abstract class JWTProviderInterface {

  abstract parse(
    secretKey: string, 
    JwToken: string
  ): {iss: unknown, aud: unknown, data: unknown}

  abstract generate<TPayload extends {[key:string]: any}>(
    param: JWTTokenParams<TPayload>
  ): string

}

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
export type JWTTokenParams<TDataPayload> = {
  secret: string
  untilMinutes: number
  data: TDataPayload
  issuer: string
  audience: string
}