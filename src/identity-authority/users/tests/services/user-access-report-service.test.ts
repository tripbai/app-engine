import { describe, it } from "node:test";
import { expect } from 'chai'
import { bind } from '../../../../bindings'
import '../../../module/mock.bindings'
import { Container } from "inversify";
import { AbstractAuthorizationProvider } from "../../../../core/providers/authorization/authorization.provider";
import { NativeRBACService } from "../../../../core/providers/authorization/rbac/rbac.service";
import { AbstractIndexerProvider } from "../../../../core/providers/indexer/indexer.provider";
import { KryptodocIndexerService } from "../../../../core/providers/indexer/kryptodoc/kryptodoc-indexer.service";
import { JsonWebToken } from "../../../../core/providers/jwt/jsonwebtoken/json-web-token.service";
import { AbstractJWTProvider } from "../../../../core/providers/jwt/jwt.provider";
import { AbstractMailProvider } from "../../../../core/providers/mail/mail.provider";
import { MailmanMail } from "../../../../core/providers/mail/mailman/mailman-mail.service";
import { AmazonSNSTopicPublisherService } from "../../../../core/providers/topics/awsns/awsns-topic-publisher.service";
import { AbstractTopicPublisherProvider } from "../../../../core/providers/topics/topic-publisher.provider";
import { MockDatabaseProvider } from "../../../../core/providers/database/mock/mock-database.provider";
import { MockCacheProvider } from "../../../../core/providers/cache/mock/mock-cache.provider";
import { UserRepository } from "../../user.repository";
import { IdentityAuthority } from "../../../module/module.interface";
import { UserModel } from "../../user.model";
import { UserAccessReportService } from "../../services/user-access-report.service";
import { AbstractDatabaseProvider } from "../../../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../../../core/providers/cache/cache.provider";

const bind_provider = (container: Container) => {
  container.bind(AbstractJWTProvider).to(JsonWebToken)
  container.bind(AbstractIndexerProvider).to(KryptodocIndexerService)
  container.bind(AbstractAuthorizationProvider).to(NativeRBACService)
  container.bind(AbstractMailProvider).to(MailmanMail)
  container.bind(AbstractTopicPublisherProvider).to(AmazonSNSTopicPublisherService)
  container.bind(AbstractDatabaseProvider).to(MockDatabaseProvider)
  container.bind(AbstractCacheProvider).to(MockCacheProvider)
}

describe('UserAccessReportService', () => {
  describe('createAccessReport', () => {
    it('should throw an error when there is no user with the provided email address', async () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const rUserRepository = await container.rebind(UserRepository)
      rUserRepository.to(class extends UserRepository {
        async getByEmailAddress(emailAddress: IdentityAuthority.Users.Fields.EmailAddress): Promise<UserModel | null> {
          return null
        }
      })
      const userAccessReportService = container.get(UserAccessReportService)
      try {
        await userAccessReportService.createAccessReport({
          provider: 'iauth',
          email_address: 'nonexistent@gmail.com' as IdentityAuthority.Users.Fields.EmailAddress,
          password: 'unknown' as IdentityAuthority.Users.Fields.RawPassword
        })
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('user not found using email address')
      }
    })

    it('should assert that the claimed identity provider by the user is the same assigned to the user', async () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const rUserRepository = await container.rebind(UserRepository)
      rUserRepository.to(class extends UserRepository {
        async getByEmailAddress(emailAddress: IdentityAuthority.Users.Fields.EmailAddress): Promise<UserModel | null> {
          const userModel = new UserModel()
          userModel.identity_provider = 'google'
          userModel.email_address = 'example@email.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress
          return userModel
        }
      })
      const userAccessReportService = container.get(UserAccessReportService)
      try {
        await userAccessReportService.createAccessReport({
          provider: 'iauth',
          email_address: 'example@email.com' as IdentityAuthority.Users.Fields.EmailAddress,
          password: 'unknown' as IdentityAuthority.Users.Fields.RawPassword
        })
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('mismatched claimed provider')
      }
    })

    it('should not support google identity provider at this time', async () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const rUserRepository = await container.rebind(UserRepository)
      rUserRepository.to(class extends UserRepository {
        async getByEmailAddress(emailAddress: IdentityAuthority.Users.Fields.EmailAddress): Promise<UserModel | null> {
          const userModel = new UserModel()
          userModel.identity_provider = 'google'
          userModel.email_address = 'example@email.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress
          return userModel
        }
      })
      const userAccessReportService = container.get(UserAccessReportService)
      try {
        await userAccessReportService.createAccessReport({
          provider: 'google',
          email_address: 'example@email.com' as IdentityAuthority.Users.Fields.EmailAddress,
          password: 'unknown' as IdentityAuthority.Users.Fields.RawPassword
        })
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('google hosted users cannot use this method')
      }
    })

    it('should not support fireauth identity provider at this time', async () => {
      const container = new Container()
      bind(container)
      bind_provider(container)
      const rUserRepository = await container.rebind(UserRepository)
      rUserRepository.to(class extends UserRepository {
        async getByEmailAddress(emailAddress: IdentityAuthority.Users.Fields.EmailAddress): Promise<UserModel | null> {
          const userModel = new UserModel()
          userModel.identity_provider = 'fireauth'
          userModel.email_address = 'example@email.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress
          return userModel
        }
      })
      const userAccessReportService = container.get(UserAccessReportService)
      try {
        await userAccessReportService.createAccessReport({
          provider: 'fireauth',
          email_address: 'example@email.com' as IdentityAuthority.Users.Fields.EmailAddress,
          password: 'unknown' as IdentityAuthority.Users.Fields.RawPassword
        })
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('fireauth hosted users cannot use this method')
      }
    })
  })
})