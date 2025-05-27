import { JWTProviderInterface, JWTTokenParams } from "../jwt-provider.interface";
import { injectable } from 'inversify';
const jwt = require('jsonwebtoken')

@injectable()
export class JsonWebToken implements JWTProviderInterface {

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