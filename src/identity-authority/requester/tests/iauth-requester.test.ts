import { describe, it } from "node:test";
import { expect } from 'chai'
import { bind } from '../../../bindings'
import '../../module/mock.bindings'
import { Container } from "inversify";
import { AbstractAuthorizationProvider } from "../../../core/providers/authorization/authorization.provider";
import { NativeRBACService } from "../../../core/providers/authorization/rbac/rbac.service";
import { AbstractCacheProvider } from "../../../core/providers/cache/cache.provider";
import { MockCacheProvider } from "../../../core/providers/cache/mock/mock-cache.provider";
import { AbstractDatabaseProvider } from "../../../core/providers/database/database.provider";
import { MockDatabaseProvider } from "../../../core/providers/database/mock/mock-database.provider";
import { AbstractIndexerProvider } from "../../../core/providers/indexer/indexer.provider";
import { KryptodocIndexerService } from "../../../core/providers/indexer/kryptodoc/kryptodoc-indexer.service";
import { JsonWebToken } from "../../../core/providers/jwt/jsonwebtoken/json-web-token.service";
import { AbstractJWTProvider } from "../../../core/providers/jwt/jwt.provider";
import { AbstractMailProvider } from "../../../core/providers/mail/mail.provider";
import { MailmanMail } from "../../../core/providers/mail/mailman/mailman-mail.service";
import { AmazonSNSTopicPublisherService } from "../../../core/providers/topics/awsns/awsns-topic-publisher.service";
import { AbstractTopicPublisherProvider } from "../../../core/providers/topics/topic-publisher.provider";
import { BaseRepository } from "../../../core/orm/repository/base-repository";
import { BaseRequester } from "../../../core/requester/requester-base";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { PublicRequester } from "../../../core/requester/requester-public";
import { Core } from "../../../core/module/module";
import { UserPermissionService } from "../../users/services/user-permission.service";
import { IAuthRequesterFactory } from "../iauth-requester.factory";

const bind_provider = (container: Container) => {
  container.bind(AbstractJWTProvider).to(JsonWebToken)
  container.bind(AbstractIndexerProvider).to(KryptodocIndexerService)
  container.bind(AbstractAuthorizationProvider).to(NativeRBACService)
  container.bind(AbstractMailProvider).to(MailmanMail)
  container.bind(AbstractTopicPublisherProvider).to(AmazonSNSTopicPublisherService)
  container.bind(AbstractDatabaseProvider).to(MockDatabaseProvider)
  container.bind(AbstractCacheProvider).to(MockCacheProvider)
}

describe('IAuthRequester', () => {

  describe('hasAllowedAccess()', () => {
    it('should return false for public requesters', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const publicRequester = iauthRequesterFactory.create(new PublicRequester({
        ipAddress: '', userAgent: ''
      }))
      expect(publicRequester.hasAllowedAccess()).to.equal(false)
    })

    it('should return false for requesters with not allowed access', () => {
      const userId = Pseudorandom.alphanum32()
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const archivedRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'archived' }, permissions: [], ipAddress: '', userAgent: ''
      }))
      const bannedRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'banned' }, permissions: [], ipAddress: '', userAgent: ''
      }))
      const deactivatedRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'deactivated' }, permissions: [], ipAddress: '', userAgent: ''
      }))
      const suspendedRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'suspended' }, permissions: [], ipAddress: '', userAgent: ''
      }))
      expect(
        !archivedRequester.hasAllowedAccess() && 
        !bannedRequester.hasAllowedAccess() && 
        !deactivatedRequester.hasAllowedAccess() && 
        !suspendedRequester.hasAllowedAccess()
      ).to.equal(true)
    })

    it('should return true for requesters with allowed access', () => {
      const userId = Pseudorandom.alphanum32()
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const activeRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'active' }, permissions: [], ipAddress: '', userAgent: ''
      }))
      const unverifiedRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'unverified' }, permissions: [], ipAddress: '', userAgent: ''
      }))
      expect(
        activeRequester.hasAllowedAccess() && 
        unverifiedRequester.hasAllowedAccess()
      ).to.equal(true)
    })
  })

  describe('isRegularUser()', () => {
    it('should return false for public requester', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const publicRequester = iauthRequesterFactory.create(new PublicRequester({
        ipAddress: '', userAgent: ''
      }))
      expect(publicRequester.isRegularUser()).to.equal(false)
    })

    it('should return true for requester with basic user permission', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const userPermissionService = container.get(UserPermissionService)
      const userId = Pseudorandom.alphanum32()
      const permissions = [userPermissionService.getBasicUserPermission(userId)]
      const someRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'active' }, permissions: permissions, ipAddress: '', userAgent: ''
      }))
      expect(someRequester.isRegularUser()).to.equal(true)
    })

    it('should return true for requester with web admin permission', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const userPermissionService = container.get(UserPermissionService)
      const userId = Pseudorandom.alphanum32()
      const permissions = [userPermissionService.getWebAdminPermission()]
      const someRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'active' }, permissions: permissions, ipAddress: '', userAgent: ''
      }))
      expect(someRequester.isRegularUser()).to.equal(true)
    })
  })

  describe('isWebAdmin', () => {
    it('should return false for public requester', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const publicRequester = iauthRequesterFactory.create(new PublicRequester({
        ipAddress: '', userAgent: ''
      }))
      expect(publicRequester.isWebAdmin()).to.equal(false)
    })

    it('should return false for requester with basic user permission', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const userPermissionService = container.get(UserPermissionService)
      const userId = Pseudorandom.alphanum32()
      const permissions = [userPermissionService.getBasicUserPermission(userId)]
      const someRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'active' }, permissions: permissions, ipAddress: '', userAgent: ''
      }))
      expect(someRequester.isWebAdmin()).to.equal(false)
    })

    it('should return true for requester with web admin permission', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const userPermissionService = container.get(UserPermissionService)
      const userId = Pseudorandom.alphanum32()
      const permissions = [userPermissionService.getWebAdminPermission()]
      const someRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userId, status: 'active' }, permissions: permissions, ipAddress: '', userAgent: ''
      }))
      expect(someRequester.isWebAdmin()).to.equal(true)
    })
  })

  describe('canOperateThisUser', () => {
    it('should return false for public requester', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userIdToOperate = Pseudorandom.alphanum32()
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const publicRequester = iauthRequesterFactory.create(new PublicRequester({
        ipAddress: '', userAgent: ''
      }))
      expect(publicRequester.canOperateThisUser(userIdToOperate)).to.equal(false)
    })

    it('should return true if the requester is the user himself', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userIdOfTheRequester = Pseudorandom.alphanum32()
      const userIdToOperate = userIdOfTheRequester
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const userPermissionService = container.get(UserPermissionService)
      const permissions = [userPermissionService.getBasicUserPermission(userIdOfTheRequester)]
      const someRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userIdOfTheRequester, status: 'active' }, permissions: permissions, ipAddress: '', userAgent: ''
      }))
      expect(someRequester.canOperateThisUser(userIdToOperate)).to.equal(true)
    })

    it('should return false if the requester is not the user he wants to operate', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userIdOfTheRequester = Pseudorandom.alphanum32()
      const userIdToOperate = Pseudorandom.alphanum32()
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const userPermissionService = container.get(UserPermissionService)
      const permissions = [userPermissionService.getBasicUserPermission(userIdOfTheRequester)]
      const someRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userIdOfTheRequester, status: 'active' }, permissions: permissions, ipAddress: '', userAgent: ''
      }))
      expect(someRequester.canOperateThisUser(userIdToOperate)).to.equal(false)
    })

    it('should return false if the requester is not the user he wants to operate, even if he is a moderator', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userIdOfTheRequester = Pseudorandom.alphanum32()
      const userIdToOperate = Pseudorandom.alphanum32()
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const userPermissionService = container.get(UserPermissionService)
      const permissions = [userPermissionService.getModeratorPermission()]
      const someRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userIdOfTheRequester, status: 'active' }, permissions: permissions, ipAddress: '', userAgent: ''
      }))
      expect(someRequester.canOperateThisUser(userIdToOperate)).to.equal(false)
    })

    it('should return true if the requester is not the user he wants to operate, but he is the web admin', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userIdOfTheRequester = Pseudorandom.alphanum32()
      const userIdToOperate = Pseudorandom.alphanum32()
      const iauthRequesterFactory = container.get(IAuthRequesterFactory)
      const userPermissionService = container.get(UserPermissionService)
      const permissions = [userPermissionService.getWebAdminPermission()]
      const someRequester = iauthRequesterFactory.create(new BaseRequester({
        user: { entity_id: userIdOfTheRequester, status: 'active' }, permissions: permissions, ipAddress: '', userAgent: ''
      }))
      expect(someRequester.canOperateThisUser(userIdToOperate)).to.equal(true)
    })


  })

})