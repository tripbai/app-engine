import { describe, it } from "node:test"
import { expect } from 'chai'
import { Core } from "../../../module/module"
import { Container } from "inversify"
import { PermissionTokenValidator } from "../permission-token.validator"
import { PermissionManager as PermissionManagerService } from "../permissions.manager"

class TokenAsserterTest {
  isConcrete(token:string): asserts token is Core.Authorization.ConcreteToken {}
  isAbstract(token:string): asserts token is Core.Authorization.AbstractToken {}
}

const container = new Container()
container.bind(PermissionTokenValidator).to(TokenAsserterTest)
container.bind(PermissionManagerService).toSelf()
const PermissionManager = container.get(PermissionManagerService)

describe('Permissions Manager', () => {
  describe('populate()', () => {
    it('should not populate when a field value is null', () => {
      expect(() => {
        PermissionManager.populate(
          'users:{entity_id}:moderate' as Core.Authorization.AbstractToken,
          { entity_id: null }
        )
      }).to.throw()
    })
    it('should successfully populate token given the placeholders and type of token is correct', () => {
      const abstractPermission = 'users:{entity_id}:moderate:{post_id}' as Core.Authorization.AbstractToken
      const concretePermission = PermissionManager.populate(
        abstractPermission,
        { entity_id: 'ja62hakshhas', post_id: 'ialskahdn213' }
      )
      expect(concretePermission).to.equal('users:ja62hakshhas:moderate:ialskahdn213')
    })
  })
  describe('satisfies()', () => {
    it('should return true if assigned permission is a prefix of the required permission', () => {
      const assigned = ['posts:6158771' as Core.Authorization.ConcreteToken]
      const required = 'posts:6158771:description:update' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(true)
    })
    it('should return true if assigned permission exactly matches the required permission', () => {
      const assigned = ['posts:6158771:description:update' as Core.Authorization.ConcreteToken]
      const required = 'posts:6158771:description:update' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(true)
    })
    it('should return false if assigned permission is a prefix but does not match the starting parts of the required permission', () => {
      const assigned = ['posts:61587712' as Core.Authorization.ConcreteToken]
      const required = 'posts:6158771:description:update' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(false)
    })
    it('should return true if wildcard in assigned permission matches the position of the required', () => {
      const assigned = ['posts:*' as Core.Authorization.ConcreteToken]
      const required = 'posts:6158771' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(true)
    })
    it('should return false if assigned permission is more specific (has more parts) than the required permission', () => {
      const assigned = ['posts:6158771:description:update' as Core.Authorization.ConcreteToken]
      const required = 'posts:6158771' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(false)
    })
    it('should return true if at least one assigned permission is a prefix of the required permission', () => {
      const assigned = [
        'posts' as Core.Authorization.ConcreteToken,
        'posts:6158771:description:update' as Core.Authorization.ConcreteToken
      ]
      const required = 'posts:6158771' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(true)
    })
    it('should return true if assigned permission contains a wildcard that matches the required permission', () => {
      const assigned = ['posts:*:description:update' as Core.Authorization.ConcreteToken]
      const required = 'posts:6158771:description:update' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(true)
    })
    it('should return false if assigned permission has a wildcard but still does not match the required permission\'s structure', () => {
      const assigned = ['*:61587712' as Core.Authorization.ConcreteToken]
      const required = 'posts:6158771:description:update' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(false)
    })
    it('should return true if wildcard in required permission makes it match an assigned permission with different initial parts', () => {
      const assigned = ['*:61587712' as Core.Authorization.ConcreteToken]
      const required = 'posts:*:description:update' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(true)
    })
    it('should return false if wildcard in assigned permission is way too specific than the required', () => {
      const assigned = ['post:61587712:*:update' as Core.Authorization.ConcreteToken]
      const required = 'posts:61587712' as Core.Authorization.ConcreteToken
      expect(PermissionManager.satisfies(assigned, required)).to.equal(false)
    })
  })
})