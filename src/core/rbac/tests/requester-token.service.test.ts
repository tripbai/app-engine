import { describe, it } from "node:test"
import { expect } from 'chai'
import { JWTProviderInterface, JWTTokenParams } from "../../providers/jwt/jwt-provider.interface"
import { Container } from "inversify";
import { JsonWebToken } from "../../providers/jwt/jsonwebtoken/json-web-token.service";
import { RequesterTokenService } from "../requester-token.service";
import { Core } from "../../core.types";
import { PermissionTokenValidator } from "../permission-token.validator";
import { AppENV } from "../../helpers/env";

AppENV.set('JWT_SECRET', 'asdasd')

describe('RequesterTokenService', () => {
  describe('parse()', () => {
    it('should return expected object shape given the token is valid', () => {
      class JWTProviderTest extends JsonWebToken {
        parse(secret: string, token: string) {
          return {
            iss: 'core/rbac',
            aud: 'test',
            data: { user: { id: 'test', status: 'active',}, permissions: [ 'users:1838127318271123' ] }
          }
        }
      }
      const container = new Container()
      container.bind(JsonWebToken).to(JWTProviderTest)
      container.bind(RequesterTokenService).toSelf()
      const requesterTokenService = container.get(RequesterTokenService)
      expect(requesterTokenService.parse('testtoken').iss).to.equal('core/rbac')
    })

    it('should throw an error if the token is invalid', () => {
      class JWTProviderTest extends JsonWebToken {
        parse(secret: string, token: string): { iss: unknown; aud: unknown; data: unknown; } {
          throw new Error()
        }
      }
      const container = new Container()
      container.bind(JsonWebToken).to(JWTProviderTest)
      container.bind(RequesterTokenService).toSelf()
      const requesterTokenService = container.get(RequesterTokenService)
      expect(()=>{
        requesterTokenService.parse('testtoken')
      }).to.throw('parsing of JWT failed due to some reason')
    })
  })

  
})
