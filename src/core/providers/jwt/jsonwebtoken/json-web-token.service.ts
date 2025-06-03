import { AbstractJWTProvider, JWTTokenParams } from "../jwt.provider";
import { injectable } from 'inversify';
const jwt = require('jsonwebtoken')

/**
 * A Service Provider that wraps around jsonwebtoken library in node
 */
@injectable()
export class JsonWebToken implements AbstractJWTProvider {

  generate<TPayload extends {[key:string]: any}>(params: JWTTokenParams<TPayload>): string {
    const expiration = Math.floor(Date.now() / 1000) + (60 * params.untilMinutes);
    const options = {issuer: params.issuer, audience: params.audience};
    return jwt.sign(
      {data: params.data, exp: expiration},
      params.secret,
      options
    )
  }

  parse(secret: string, token: string){
    try {
      let parsed: {iss: unknown, aud: unknown, data: unknown}
        = jwt.verify(token, secret)
      return parsed
    } catch (error) {
      throw new Error(error.message)
    }
  }

}