
import { ResourceAccessForbiddenException } from "../exceptions/exceptions"
import { AppENV } from "../helpers/env"
import { JwtHelper } from "../helpers/jwt"
import { AuthTokenPayload } from "../interface"
import { BaseRequester, PublicRequester } from "./requester"

const jwt = require('jsonwebtoken')

export namespace RequesterToken {

  type ParsedPayload = { iss: string, aud: string,  data: AuthTokenPayload }

  export const parse = (token: string): ParsedPayload => {
    let parsed: ParsedPayload | null = null
    let message = ''
    try {
      parsed = jwt.verify(token, AppENV.get('JWT_SECRET'))
    } catch (error) {
      message = error.message
    }
    if (parsed===null) {
      throw new ResourceAccessForbiddenException({
        message: 'parsing of JWT failed due to some reason',
        data: {
          error: {message: message}
        }
      })
    }
    return parsed
  }

  /**
   * Generates a Requester token. Requester tokens are always issued by the Kernel Application. 
   * Microservices that generates Requester tokens must provide `kernel` as the issuer so that
   * it will be accepted.
   * @param Tenant - TenantModel
   * @param data - the required data for authorization
   * @returns 
   */
  export const generate = (data: AuthTokenPayload): string => {
    return JwtHelper.generate<{payload: AuthTokenPayload}>({
      secret: AppENV.get('JWT_SECRET'),
      untilMinutes: 30,
      data: data,
      issuer: 'kernel',
      audience: data.user.id
    })
  }

}