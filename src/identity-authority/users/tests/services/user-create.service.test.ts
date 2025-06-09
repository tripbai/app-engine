import { describe, it } from "node:test";
import { expect } from 'chai'
import { AbstractDatabaseProvider, DatabaseTransactionStep, FlatDatabaseRecord } from "../../../../core/providers/database/database.provider";
import { MockDatabaseProvider } from "../../../../core/providers/database/mock/mock-database.provider";
import { UserAssertions } from "../../user.assertions";
import { IdentityAuthority } from "../../../module/module.interface";
import { Container } from "inversify";
import { UserCreateService } from "../../services/user-create.service";
import { bind } from '../../../../bindings'
import '../../../module/mock.bindings'
import { MockCacheProvider } from "../../../../core/providers/cache/mock/mock-cache.provider";
import { AbstractCacheProvider } from "../../../../core/providers/cache/cache.provider";
import { AbstractJWTProvider } from "../../../../core/providers/jwt/jwt.provider";
import { JsonWebToken } from "../../../../core/providers/jwt/jsonwebtoken/json-web-token.service";
import { AbstractIndexerProvider } from "../../../../core/providers/indexer/indexer.provider";
import { KryptodocIndexerService } from "../../../../core/providers/indexer/kryptodoc/kryptodoc-indexer.service";
import { AbstractAuthorizationProvider } from "../../../../core/providers/authorization/authorization.provider";
import { NativeRBACService } from "../../../../core/providers/authorization/rbac/rbac.service";
import { AbstractMailProvider } from "../../../../core/providers/mail/mail.provider";
import { MailmanMail } from "../../../../core/providers/mail/mailman/mailman-mail.service";
import { AbstractTopicPublisherProvider } from "../../../../core/providers/topics/topic-publisher.provider";
import { AmazonSNSTopicPublisherService } from "../../../../core/providers/topics/awsns/awsns-topic-publisher.service";

const bindProviders = (container: Container) => {
  container.bind(AbstractJWTProvider).to(JsonWebToken)
  container.bind(AbstractIndexerProvider).to(KryptodocIndexerService)
  container.bind(AbstractAuthorizationProvider).to(NativeRBACService)
  container.bind(AbstractMailProvider).to(MailmanMail)
  container.bind(AbstractTopicPublisherProvider).to(AmazonSNSTopicPublisherService)
}

describe('UserCreateService', () => {
  describe('createUser()', () => {
    it('should throw an error when isUniqueEmailAddress throws an error', async () => {
      class TestUserAssertion extends UserAssertions {
        async isUniqueEmailAddress(value: unknown): Promise<IdentityAuthority.Users.Fields.UniqueEmailAddress> {
          throw new Error('user already exists with the same email address')
        }
      }
      class TestDatabaseProvider extends MockDatabaseProvider {}
      class TestCacheProvider extends MockCacheProvider{}
      const localContainer = new Container()
      localContainer.bind(AbstractDatabaseProvider).to(MockDatabaseProvider)
      localContainer.bind(AbstractCacheProvider).to(TestCacheProvider)
      bind(localContainer)
      bindProviders(localContainer)
      const rebound = await localContainer.rebind(UserAssertions)
      rebound.to(TestUserAssertion)
      const userCreateService = localContainer.get(UserCreateService)
      try {
        await userCreateService.createIAuthUser(
          'iauth',
          'external',
          'user',
          'concrete',
          'sampleusername' as IdentityAuthority.Users.Fields.Username,
          'sampleemail@gmail.com'  as IdentityAuthority.Users.Fields.EmailAddress,
          'helloworld' as IdentityAuthority.Users.Fields.RawPassword,
          'active'
        )
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('user already exists with the same email address')
      }
      
    })

    it('should throw an error when isUniqueUsername throws an error', async () => {
      class TestUserAssertion extends UserAssertions {
        async isUniqueEmailAddress(value: unknown): Promise<IdentityAuthority.Users.Fields.UniqueEmailAddress> {
          return 'uniqueemailaddress' as IdentityAuthority.Users.Fields.UniqueEmailAddress
        }
        async isUniqueUsername(value: unknown): Promise<IdentityAuthority.Users.Fields.UniqueUsername> {
          throw new Error('user already exists with the same username')
        }
      }
      class TestDatabaseProvider extends MockDatabaseProvider {}
      class TestCacheProvider extends MockCacheProvider{}
      const container = new Container()
      bind(container)
      bindProviders(container)
      container.bind(AbstractDatabaseProvider).to(TestDatabaseProvider)
      container.bind(AbstractCacheProvider).to(TestCacheProvider)
      const rebound = await container.rebind(UserAssertions)
      rebound.to(TestUserAssertion)
      const userCreateService = container.get(UserCreateService)
      try {
        await userCreateService.createIAuthUser(
          'iauth',
          'external',
          'user',
          'concrete',
          'sampleusername' as IdentityAuthority.Users.Fields.Username,
          'sampleemail@gmail.com'  as IdentityAuthority.Users.Fields.EmailAddress,
          'helloworld' as IdentityAuthority.Users.Fields.RawPassword,
          'active'
        )
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('user already exists with the same username')
      }
      
    })
  })
})