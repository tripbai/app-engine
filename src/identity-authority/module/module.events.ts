import { Container } from "inversify";
import { AbstractEventManagerProvider } from "../../core/providers/event/event-manager.provider";
import { UserCreateEvent, UserUpdateEvent } from "../users/user.events";
import { UserSnippetIndexer } from "../users/event-listeners/user-snippet-indexer";
import { AccountVerificationEmailSender } from "../users/event-listeners/send-account-verification-email";
import { TenantSnippetIndexer } from "../tenants/event-listeners/tenant-snippet-indexer";
import { TenantCreateEvent, TenantUpdateEvent } from "../tenants/tenant.events";

export const IdentityAuthorityEvents = (
  container: Container
) => {

  const abstractEventManager = container.get(AbstractEventManagerProvider)
  const userSnippetIndexer   = container.get(UserSnippetIndexer)
  const accountVerificationEmailSender = container.get(AccountVerificationEmailSender)
  const tenantSnippetIndexer = container.get(TenantSnippetIndexer)

  // Index user snippet for newly created or updated users
  abstractEventManager.listen(new UserCreateEvent,userSnippetIndexer.execute)
  abstractEventManager.listen(new UserUpdateEvent,userSnippetIndexer.execute)

  // Send account verification email when a user is created
  abstractEventManager.listen(new UserCreateEvent,accountVerificationEmailSender.execute)

  // Index tenant snippet for newly created tenants
  abstractEventManager.listen(new TenantCreateEvent, tenantSnippetIndexer.execute)
  abstractEventManager.listen(new TenantUpdateEvent, tenantSnippetIndexer.execute)


}