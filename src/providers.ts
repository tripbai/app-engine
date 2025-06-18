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

export const providers = (container: Container) => {

  /** Configs */
  container.bind(AbstractAWSCredentials).to(AWSEnvCredentials)
  container.bind(AbstractKryptodocConfig).to(KryptodocEnvConfig)
  container.bind(AbstractMySqlConfig).to(MySqlEnvConfig)
  container.bind(AbstractMySqlPoolService).to(MySqlPoolService)
  container.bind(AbstractNodeEmitterConfig).to(NodeEmitterEnvConfig)

  container.bind(AbstractCacheProvider).to(RedisCacheService)
  container.bind(AbstractDatabaseProvider).to(MySqlService)
  container.bind(AbstractJWTProvider).to(JsonWebToken)
  container.bind(AbstractIndexerProvider).to(KryptodocIndexerService)
  container.bind(AbstractAuthorizationProvider).to(NativeRBACService)
  container.bind(AbstractMailProvider).to(MailmanMail)
  container.bind(AbstractTopicPublisherProvider).to(AmazonSNSTopicPublisherService)
  container.bind(AbstractEventManagerProvider).to(SimpleNodeEmitter)
}