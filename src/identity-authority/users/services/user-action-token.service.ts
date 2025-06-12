import { inject, injectable } from "inversify";
import { Core } from "../../../core/module/module";
import { IdentityAuthority } from "../../module/module.interface";
import { AbstractJWTProvider } from "../../../core/providers/jwt/jwt.provider";
import { AppENV } from "../../../core/helpers/env";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { UserAssertions } from "../user.assertions";

export type UserActionTokenPayload = {
  action: 'password:reset_confirmation'
  user_id: Core.Entity.Id
} | {
  action: 'email_address:confirmation_token'
  user_id: Core.Entity.Id
  new_email_address: IdentityAuthority.Users.Fields.EmailAddress
} | {
  action: 'account:verification_token'
  user_id: Core.Entity.Id
}

@injectable()
export class UserActionTokenService {

  private issuer: 'identity-authority:actions'

  constructor(
    @inject(AbstractJWTProvider) public readonly abstractJwtProvider: AbstractJWTProvider,
    @inject(UserAssertions) public readonly userAssertions: UserAssertions
  ){}

  generate(payload: UserActionTokenPayload){
    return this.abstractJwtProvider.generate<UserActionTokenPayload>({
      issuer: this.issuer,
      audience: payload.user_id,
      data: payload,
      untilMinutes: this.getTokenExpiryPerAction(payload),
      secret: AppENV.get('SECRET_KEY')
    })
  }

  getTokenExpiryPerAction(payload: UserActionTokenPayload): number {
    if (payload.action === 'password:reset_confirmation') {
      return 60 /** 60 minutes */
    }
    if (payload.action === 'account:verification_token') {
      return 60 * 12 /** Half-day  */
    }
    return 60 * 24 /** 1 full day */
  }

  parse(userId: Core.Entity.Id, token: string): UserActionTokenPayload {
    const parsedToken = this.abstractJwtProvider.parse(
      AppENV.get('SECRET_KEY'),
      token
    )
    if (typeof parsedToken.iss !== 'string') {
      throw new Error('invalid user action token: missing issuer')
    }
    if (parsedToken.iss !== this.issuer) {
      throw new Error('invalid user action token: issuer mismatch')
    }
    if (typeof parsedToken.aud !== 'string') {
      throw new Error('invalid user action token: missing audience')
    }
    if (typeof parsedToken.aud !== userId) {
      throw new Error('invalid user action token: audience mismatch')
    }
    if (typeof parsedToken.data !== 'object') {
      throw new Error('invalid user action token: missing data')
    }
    if (parsedToken.data === null) {
      throw new Error('invalid user action token: missing data')
    }
    const payload = parsedToken.data
    if ('action' in payload && payload.action === 'password:reset_confirmation') {
      if ('user_id' in payload) {
        EntityToolkit.Assert.idIsValid(payload.user_id)
        return {
          action: 'password:reset_confirmation',
          user_id: payload.user_id
        }
      }
    }
    if ('action' in payload && payload.action === 'email_address:confirmation_token') {
      if ('user_id' in payload && 'email_address' in payload) {
        EntityToolkit.Assert.idIsValid(payload.user_id)
        this.userAssertions.isEmailAddress(payload.email_address)
        return {
          action: 'email_address:confirmation_token',
          user_id: payload.user_id,
          new_email_address: payload.email_address
        }
      }
    }
    if ('action' in payload && payload.action === 'email_address:confirmation_tokenaccount:verification_token') {
      if ('user_id' in payload) {
        EntityToolkit.Assert.idIsValid(payload.user_id)
        return {
          action: 'account:verification_token',
          user_id: payload.user_id
        }
      }
    }
    throw new Error('invalid user action: invalid payload type')
  }

}