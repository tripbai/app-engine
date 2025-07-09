import { Container } from "inversify";
import { AbstractJWTProvider } from "./core/providers/jwt/jwt.provider";
import { JsonWebToken } from "./core/providers/jwt/jsonwebtoken/json-web-token.service";
import { AbstractAuthorizationProvider } from "./core/providers/authorization/authorization.provider";
import { NativeRBACService } from "./core/providers/authorization/rbac/rbac.service";
import { AbstractIndexerProvider } from "./core/providers/indexer/indexer.provider";
import { KryptodocIndexerService } from "./core/providers/indexer/kryptodoc/kryptodoc-indexer.service";
import { AbstractMailProvider } from "./core/providers/mail/mail.provider";
import { MailmanMail } from "./core/providers/mail/mailman/mailman-mail.service";
import { AmazonSNSTopicPublisherService } from "./core/providers/topics/awsns/awsns-topic-publisher.service";
import { AbstractTopicPublisherProvider } from "./core/providers/topics/topic-publisher.provider";
import { AbstractCacheProvider } from "./core/providers/cache/cache.provider";
import { RedisCacheService } from "./core/providers/cache/redis/redis.service";
import { AbstractDatabaseProvider } from "./core/providers/database/database.provider";
import { MySqlService } from "./core/providers/database/mysql/mysql.service";
import { AbstractAWSCredentials } from "./core/services/aws/aws-credentials.interface";
import { AWSEnvCredentials } from "./core/services/aws/aws-env-credentials";
import { AbstractKryptodocConfig } from "./core/services/kryptodoc/kryptodoc-config.interface";
import { KryptodocEnvConfig } from "./core/services/kryptodoc/kryptodoc-env-config";
import { AbstractMySqlConfig } from "./core/services/mysql/mysql-config.interface";
import { MySqlEnvConfig } from "./core/services/mysql/mysql-env-config";
import { AbstractMySqlPoolService } from "./core/services/mysql/mysql-pool-service.interface";
import { MySqlPoolService } from "./core/services/mysql/mysql-pool-service";
import { AbstractEventManagerProvider } from "./core/providers/event/event-manager.provider";
import { SimpleNodeEmitter } from "./core/providers/event/node-emitter/node-emitter.service";
import { AbstractNodeEmitterConfig } from "./core/services/events/node-emitter/node-emitter-config.interface";
import { NodeEmitterEnvConfig } from "./core/services/events/node-emitter/node-emitter-env-config";
import { AbstractObjectStorageProvider } from "./core/providers/storage/object-storage.provider";
import { AmazonS3StorageService } from "./core/providers/storage/aws3/aws3-storage.service";
import { IAuthDatabaseProvider } from "./identity-authority/providers/iauth-database.provider";
import { JSONFileDB } from "./core/providers/database/jsonfiledb/jsonfile-database.service";
import { Application } from "./core/application";
import { FirestoreService } from "./core/providers/database/firestore/firestore.service";
import { InMemoryCacheService } from "./core/providers/cache/inmemory/inmemory-cache.service";

export const providers = (container: Container) => {

  /** Configs */
  container.bind(AbstractAWSCredentials).to(AWSEnvCredentials)
  container.bind(AbstractKryptodocConfig).to(KryptodocEnvConfig)
  container.bind(AbstractMySqlConfig).to(MySqlEnvConfig)
  container.bind(AbstractMySqlPoolService).to(MySqlPoolService)
  container.bind(AbstractNodeEmitterConfig).to(NodeEmitterEnvConfig)

  container.bind(AbstractDatabaseProvider).to(MySqlService)
  container.bind(AbstractJWTProvider).to(JsonWebToken)
  container.bind(AbstractIndexerProvider).to(KryptodocIndexerService)
  container.bind(AbstractAuthorizationProvider).to(NativeRBACService)
  container.bind(AbstractMailProvider).to(MailmanMail)
  container.bind(AbstractTopicPublisherProvider).to(AmazonSNSTopicPublisherService)
  container.bind(AbstractEventManagerProvider).to(SimpleNodeEmitter)
  container.bind(AbstractObjectStorageProvider).to(AmazonS3StorageService)

  // Declare bindings based on environment
  if (Application.environment() === 'development') {
    container.bind(IAuthDatabaseProvider).to(JSONFileDB)
    container.bind(AbstractCacheProvider).to(InMemoryCacheService)
  } else if (Application.environment() === 'staging') {
    container.bind(IAuthDatabaseProvider).to(FirestoreService)
    container.bind(AbstractCacheProvider).to(RedisCacheService)
  } else if (Application.environment() === 'production') {
    container.bind(IAuthDatabaseProvider).to(FirestoreService)
    container.bind(AbstractCacheProvider).to(RedisCacheService)
  } else {

  }
}