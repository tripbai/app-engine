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
import { IAuthPermissionsService } from "../iauth-permissions.service";
import { BaseRepository } from "../../../core/orm/repository/base-repository";
import { BaseRequester } from "../../../core/requester/requester-base";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { PublicRequester } from "../../../core/requester/requester-public";
import { Core } from "../../../core/module/module";
import { UserPermissionService } from "../../users/services/user-permission.service";

const bind_provider = (container: Container) => {
  container.bind(AbstractJWTProvider).to(JsonWebToken)
  container.bind(AbstractIndexerProvider).to(KryptodocIndexerService)
  container.bind(AbstractAuthorizationProvider).to(NativeRBACService)
  container.bind(AbstractMailProvider).to(MailmanMail)
  container.bind(AbstractTopicPublisherProvider).to(AmazonSNSTopicPublisherService)
  container.bind(AbstractDatabaseProvider).to(MockDatabaseProvider)
  container.bind(AbstractCacheProvider).to(MockCacheProvider)
}

describe('IAuthPermissionService', () => {
  describe('isRequesterHasAllowedStatus', () => {
    it('should not accept malformed requester', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        // @ts-expect-error
        iAuthPermissionService.isRequesterHasAllowedStatus(new BaseRequester({
          user: null,
          permissions: []
        }))
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('requester has no allowed status')
      }
    })
    it('should not accept requester with non allowed status', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        iAuthPermissionService.isRequesterHasAllowedStatus(new BaseRequester({
          user: { entity_id: Pseudorandom.alphanum32(), status: 'banned' },
          permissions: [],
          ipAddress: '',
          userAgent: ''
        }))
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('requester has no allowed status')
      }
    })
    it('should not accept requester with non allowed status even if it is the webadmin', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      const userPermissionService = container.get(UserPermissionService)
      try {
        iAuthPermissionService.isRequesterHasAllowedStatus(new BaseRequester({
          user: { entity_id: Pseudorandom.alphanum32(), status: 'banned' },
          permissions: [userPermissionService.getWebAdminPermission()],
          ipAddress: '',
          userAgent: ''
        }))
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('requester has no allowed status')
      }
    })
    it('should throw an error with public requester', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        iAuthPermissionService.isRequesterHasAllowedStatus(new PublicRequester({
          ipAddress: '',
          userAgent: ''
        }) )
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('requester has no allowed status')
      }
    })
  })

  describe('isRequesterHasBasicUserPermission', () => {
    it('should throw an error for public requesters', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        iAuthPermissionService.isRequesterHasBasicUserPermission(new PublicRequester({
          ipAddress: '',
          userAgent: ''
        }) )
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('requester has no basic access permission')
      }
    })

    it('should not throw an error for basic users', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      const userPermissionService = container.get(UserPermissionService)
      const userId = Pseudorandom.alphanum32()
      try {
        iAuthPermissionService.isRequesterHasBasicUserPermission(new BaseRequester({
          user: {entity_id: userId, status: 'unverified' },
          permissions: [userPermissionService.getBasicUserPermission(userId)],
          ipAddress: '',
          userAgent: ''
        }) )
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('the above code did not throw an error')
      }
    })

    it('should not throw an error for the web admin user', () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      const userPermissionService = container.get(UserPermissionService)
      const userId = Pseudorandom.alphanum32()
      try {
        iAuthPermissionService.isRequesterHasBasicUserPermission(new BaseRequester({
          user: { entity_id: Pseudorandom.alphanum32(), status: 'active' },
          permissions: [userPermissionService.getWebAdminPermission()],
          ipAddress: '',
          userAgent: ''
        }) )
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('the above code did not throw an error')
      }

    })
  })

  describe('canRequesterOperateThisUser()', () => {
    it('should throw an error if the requester is public', () => {
      const userIdToOperate = Pseudorandom.alphanum32()
      const testRequester = new PublicRequester({
        ipAddress: '',
        userAgent: ''
      })
      const container = new Container()
      bind(container)
      bind_provider(container)
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        /** @ts-expect-error */
        iAuthPermissionService.canRequesterOperateThisUser(testRequester, userIdToOperate)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('requester has no permission to operate on this user')
      }
    })

    it('should throw an error if the user id is different', () => {
      const userIdToOperate = Pseudorandom.alphanum32()
      const userIdInRequester = Pseudorandom.alphanum32()
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userPermissionService = container.get(UserPermissionService)
      const userPermissions: Array<Core.Authorization.ConcreteToken> = []
      userPermissionService.addPermissionsByRole(
        userPermissions, userIdInRequester, 'user'
      )
      const testRequester = new BaseRequester(
        {
          user: { entity_id: userIdInRequester, status: 'active' },
          permissions: userPermissions,
          ipAddress: '',
          userAgent: ''
        }
      )
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        /** @ts-expect-error */
        iAuthPermissionService.canRequesterOperateThisUser(testRequester, userIdToOperate)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('requester has no permission to operate on this user')
      }
    })

    it('should allow user to operate himself', () => {
      const userIdToOperate = Pseudorandom.alphanum32()
      const userIdInRequester = userIdToOperate
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userPermissionService = container.get(UserPermissionService)
      const userPermissions: Array<Core.Authorization.ConcreteToken> = []
      userPermissionService.addPermissionsByRole(
        userPermissions, userIdInRequester, 'user'
      )
      const testRequester = new BaseRequester(
        {
          user: { entity_id: userIdInRequester, status: 'active' },
          permissions: userPermissions,
          ipAddress: '',
          userAgent: ''
        }
      )
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        /** @ts-expect-error */
        iAuthPermissionService.canRequesterOperateThisUser(testRequester, userIdToOperate)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('the above code did not throw an error')
      }
    })

    it('should not allow users with moderator access to operate other users', () => {
      const userIdToOperate = Pseudorandom.alphanum32()
      const userIdInRequester = Pseudorandom.alphanum32()
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userPermissionService = container.get(UserPermissionService)
      const userPermissions: Array<Core.Authorization.ConcreteToken> = []
      userPermissionService.addPermissionsByRole(
        userPermissions, userIdInRequester, 'moderator'
      )
      const testRequester = new BaseRequester(
        {
          user: { entity_id: userIdInRequester, status: 'active' },
          permissions: userPermissions,
          ipAddress: '',
          userAgent: ''
        }
      )
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        /** @ts-expect-error */
        iAuthPermissionService.canRequesterOperateThisUser(testRequester, userIdToOperate)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('requester has no permission to operate on this user')
      }
    })

    it('should allow different user id, but has webadmin access', () => {
      const userIdToOperate = Pseudorandom.alphanum32()
      const userIdInRequester = Pseudorandom.alphanum32()
      const container = new Container()
      bind(container)
      bind_provider(container)
      const userPermissionService = container.get(UserPermissionService)
      const userPermissions: Array<Core.Authorization.ConcreteToken> = []
      userPermissionService.addPermissionsByRole(
        userPermissions, userIdInRequester, 'webadmin'
      )
      const testRequester = new BaseRequester(
        {
          user: { entity_id: userIdInRequester, status: 'active' },
          permissions: userPermissions,
          ipAddress: '',
          userAgent: ''
        }
      )
      const iAuthPermissionService: IAuthPermissionsService = container.get(IAuthPermissionsService)
      try {
        /** @ts-expect-error */
        iAuthPermissionService.canRequesterOperateThisUser(testRequester, userIdToOperate)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('the above code did not throw an error')
      }
    })
  })
})