import { describe, it } from "node:test"
import { expect } from 'chai'
import { Core } from "../../core.types"
import { Container } from "inversify"
import { RequesterFactory } from "../requester-factory"
import { PublicRequester } from "../public-requester"
import { RequesterTokenService } from "../requester-token.service"
import { JsonWebToken } from "../../providers/jwt/jsonwebtoken/json-web-token.service"
import { JWTProviderInterface, JWTTokenParams } from "../../providers/jwt/jwt-provider.interface"
import { BaseRequester } from "../base-requester"

describe('RequesterFactory', () => {
  describe('create()', () => {
    it('should create public requester if the token is null', () => {
      const container = new Container()
      container.bind(JsonWebToken).toSelf()
      container.bind(RequesterTokenService).toSelf()
      container.bind(RequesterFactory).toSelf()
      const requesterFactory = container.get(RequesterFactory)
      expect(requesterFactory.create({token:null,ipAddress:'0.0.0.0',userAgent:'test'})).to.instanceOf(PublicRequester)
    })

    it('should create public requester if there is no payload data in the token', () => {
      const container = new Container()
      class JWTProviderTest implements JWTProviderInterface {
        generate(param): string {return '';}
        parse(secret: string, token: string): { iss: unknown; aud: unknown; data: unknown; } {
          // @ts-expect-error
          return {
            iss: 'core/rbac',
            aud: 'test'
          }
        }
      }
      class RequesterTokenServiceTest {
        JWTProvider = new JWTProviderTest 
        issuer = ''
        parse() {return {iss: this.issuer, aud: '', data: this.JWTProvider.parse('','').data}}
      }
      container.bind(JsonWebToken).to(JWTProviderTest)
      container.bind(RequesterTokenService).to(RequesterTokenServiceTest)
      container.bind(RequesterFactory).toSelf()
      const requesterFactory = container.get(RequesterFactory)
      expect(requesterFactory.create({token:'mocktoken',ipAddress:'0.0.0.0',userAgent:'test'})).to.instanceOf(PublicRequester)
    })


    it('should create public requester if there is no payload data in the token', () => {
      const container = new Container()
      class JWTProviderTest implements JWTProviderInterface {
        generate(param): string {return '';}
        parse(secret: string, token: string): { iss: unknown; aud: unknown; data: unknown; } {
          return {
            iss: 'core/rbac',
            aud: 'test',
            data: { permissions: [ 'users:1838127318271123' ] }
          }
        }
      }
      class RequesterTokenServiceTest {
        JWTProvider = new JWTProviderTest 
        issuer = ''
        parse() {return {iss: this.issuer, aud: '', data: this.JWTProvider.parse('','').data}}
      }
      container.bind(JsonWebToken).to(JWTProviderTest)
      container.bind(RequesterTokenService).to(RequesterTokenServiceTest)
      container.bind(RequesterFactory).toSelf()
      const requesterFactory = container.get(RequesterFactory)
      expect(requesterFactory.create({token:'mocktoken',ipAddress:'0.0.0.0',userAgent:'test'})).to.instanceOf(PublicRequester)
    })

    it('should create public requester if the user status is invalid in the token', () => {
      const container = new Container()
      class JWTProviderTest implements JWTProviderInterface {
        generate(param): string {return '';}
        parse(secret: string, token: string): { iss: unknown; aud: unknown; data: unknown; } {
          return {
            iss: 'core/rbac',
            aud: 'test',
            data: { user: { id: 'test', status: 'invalid-status',}, permissions: [ 'users:1838127318271123' ] }
          }
        }
      }
      class RequesterTokenServiceTest {
        JWTProvider = new JWTProviderTest 
        issuer = ''
        parse() {return {iss: this.issuer, aud: '', data: this.JWTProvider.parse('','').data}}
      }
      container.bind(JsonWebToken).to(JWTProviderTest)
      container.bind(RequesterTokenService).to(RequesterTokenServiceTest)
      container.bind(RequesterFactory).toSelf()
      const requesterFactory = container.get(RequesterFactory)
      expect(requesterFactory.create({token:'mocktoken',ipAddress:'0.0.0.0',userAgent:'test'})).to.instanceOf(PublicRequester)
    })

    it('should successfully create requester given all the validations passed', () => {
      const container = new Container()
      class JWTProviderTest implements JWTProviderInterface {
        generate(param): string {return '';}
        parse(secret: string, token: string): { iss: unknown; aud: unknown; data: unknown; } {
          return {
            iss: 'core/rbac',
            aud: 'test',
            data: { user: { id: 'test', status: 'active',}, permissions: [ 'users:1838127318271123' ] }
          }
        }
      }
      class RequesterTokenServiceTest {
        JWTProvider = new JWTProviderTest 
        issuer = ''
        parse() {return {iss: this.issuer, aud: '', data: this.JWTProvider.parse('','').data}}
      }
      container.bind(JsonWebToken).to(JWTProviderTest)
      container.bind(RequesterTokenService).to(RequesterTokenServiceTest)
      container.bind(RequesterFactory).toSelf()
      const requesterFactory = container.get(RequesterFactory)
      expect(requesterFactory.create({token:'mocktoken',ipAddress:'0.0.0.0',userAgent:'test'})).to.instanceOf(BaseRequester)
    })
    
  })
})