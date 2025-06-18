import { Container } from "inversify"
import { AbstractAuthorizationProvider } from "../../core/providers/authorization/authorization.provider"
import { NativeRBACService } from "../../core/providers/authorization/rbac/rbac.service"
import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider"
import { InMemoryCacheService } from "../../core/providers/cache/inmemory/inmemory-cache.service"
import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider"
import { InMemoryDatabaseService } from "../../core/providers/database/inmemory/inmemory-database.service"
import { AbstractIndexerProvider, IndexTaskItem } from "../../core/providers/indexer/indexer.provider"
import { JsonWebToken } from "../../core/providers/jwt/jsonwebtoken/json-web-token.service"
import { AbstractJWTProvider } from "../../core/providers/jwt/jwt.provider"
import { AbstractMailProvider, SendMailParams } from "../../core/providers/mail/mail.provider"
import { AbstractTopicPublisherProvider } from "../../core/providers/topics/topic-publisher.provider"
import { AbstractEventManagerProvider } from "../../core/providers/event/event-manager.provider"

class DummyIndexerProvider implements AbstractIndexerProvider {
  hasIndexed = false
  async index(tasks: IndexTaskItem[]): Promise<void> {
    this.hasIndexed = true
  }
}

class DummyMailProvider implements AbstractMailProvider {
  hasEmailSent = false
  async sendEmail(params: SendMailParams): Promise<void> {
    this.hasEmailSent = true
  }
}

class DummyTopicPublisherProvider implements AbstractTopicPublisherProvider {
  hasPublishedTopic = false
  async publishTopic(topicId: string, message: string, options?: { subject?: string | undefined, messageAttributes?: { [key: string]: { DataType: "String", StringValue: string } } | undefined, messageGroupId?: string | undefined, messageDeduplicationId?: string | undefined } | undefined): Promise<void> {
    this.hasPublishedTopic = true
  }
}

class DummyEventManagerProvider implements AbstractEventManagerProvider {
  hasDispatchedEvent = false
  listen(EventInterface, handler) {}
  async dispatch(EventInterface, ...data: any) {
    this.hasDispatchedEvent = true
  }
}

export const bindTripBaiTestProviders = (container: Container) => {
  container.bind(AbstractJWTProvider).to(JsonWebToken)
  container.bind(AbstractIndexerProvider).to(DummyIndexerProvider)
  container.bind(AbstractAuthorizationProvider).to(NativeRBACService)
  container.bind(AbstractMailProvider).to(DummyMailProvider)
  container.bind(AbstractTopicPublisherProvider).to(DummyTopicPublisherProvider)
  container.bind(AbstractEventManagerProvider).to(DummyEventManagerProvider)
}