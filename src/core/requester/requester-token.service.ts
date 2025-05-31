import { inject, injectable } from 'inversify'
import { ResourceAccessForbiddenException } from '../exceptions/exceptions'
import { AppENV } from '../helpers/env'
import { JsonWebToken } from '../providers/jwt/jsonwebtoken/json-web-token.service'
import { JWTProviderInterface } from '../providers/jwt/jwt.provider'
import { Core } from '../core.types'



@injectable()
export class RequesterTokenService {

  issuer = 'core/requester'

  constructor(
    @inject(JsonWebToken) public readonly JWTProvider: JWTProviderInterface
  ) {}

  parse(requesterToken: string): {iss: string, aud: string, data: unknown } {
    let parsed: {iss: unknown, aud: unknown, data: unknown } | null = null
    let message = ''
    try {
      parsed = this.JWTProvider.parse(AppENV.get('JWT_SECRET'), requesterToken)
    } catch (error) {
      message = error.message
    }
    if (parsed == null) {
      throw new ResourceAccessForbiddenException({
        message: 'parsing of JWT failed due to some reason',
        data: {
          error: {message: message}
        }
      })
    }
    if (!('iss' in parsed)) {
      throw new ResourceAccessForbiddenException({
        message: 'missing issuer in requester token',
        data: {token: requesterToken}
      })
    }
    if (typeof parsed.iss !== 'string') {
      throw new ResourceAccessForbiddenException({
        message: 'invalid issuer type in requester token',
        data: {token: requesterToken}
      })
    }
    if (parsed.iss !== this.issuer) {
      throw new ResourceAccessForbiddenException({
        message: 'mismatched issuer in requester token',
        data: {token: requesterToken}
      })
    }
    if (!('aud' in parsed)) {
      throw new ResourceAccessForbiddenException({
        message: 'missing audience in requester token',
        data: {token: requesterToken}
      })
    }
    if (typeof parsed.aud !== 'string') {
      throw new ResourceAccessForbiddenException({
        message: 'invalid audience type in requester token',
        data: {token: requesterToken}
      })
    }
    return {
      iss: parsed.iss,
      aud: parsed.aud,
      data: parsed.data
    }
  }

  generate(payload: {
    user: { id: string, status: Core.User.Status },
    permissions: Array<Core.Authorization.ConcreteToken>
  }){
    return this.JWTProvider.generate({
      secret: AppENV.get('JWT_SECRET'),
      untilMinutes: 30,
      data: payload,
      issuer: this.issuer,
      audience: payload.user.id
    })
  }
}