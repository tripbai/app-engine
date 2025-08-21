import { Container } from "inversify";
import { AbstractEventManagerProvider } from "../../core/providers/event/event-manager.provider";
import { UserCreateEvent, UserUpdateEvent } from "../users/user.events";
import { UserSnippetIndexer } from "../users/event-listeners/user-snippet-indexer";
import { AccountVerificationEmailSender } from "../users/event-listeners/send-account-verification-email";
import { TenantSnippetIndexer } from "../tenants/event-listeners/tenant-snippet-indexer";
import {
  TenantCreateEvent,
  TenantTeamAccessEvent,
  TenantUpdateEvent,
} from "../tenants/tenant.events";
import { TenantTeamAccessIndexer } from "../tenants/event-listeners/tenant-team-indexer";

export const IdentityAuthorityEvents = (container: Container) => {
  const abstractEventManager = container.get(AbstractEventManagerProvider);
  const userSnippetIndexer = container.get(UserSnippetIndexer);
  const accountVerificationEmailSender = container.get(
    AccountVerificationEmailSender
  );
  const tenantSnippetIndexer = container.get(TenantSnippetIndexer);
  const tenantTeamIndexer = container.get(TenantTeamAccessIndexer);

  // Index user snippet for newly created or updated users
  abstractEventManager.listen(new UserCreateEvent(), async (...args) => {
    await userSnippetIndexer.execute(...args);
  });

  abstractEventManager.listen(new UserUpdateEvent(), async (...args) => {
    await userSnippetIndexer.execute(...args);
  });

  // Send account verification email when a user is created
  // abstractEventManager.listen(new UserCreateEvent, async (...args) => {
  //   await accountVerificationEmailSender.execute(...args)
  // })

  // Index tenant snippet for newly created tenants
  abstractEventManager.listen(new TenantCreateEvent(), async (...args) => {
    await tenantSnippetIndexer.execute(...args);
  });

  abstractEventManager.listen(new TenantUpdateEvent(), async (...args) => {
    await tenantSnippetIndexer.execute(...args);
  });

  // Index tenant team access for user actions
  abstractEventManager.listen(new TenantTeamAccessEvent(), async (...args) => {
    await tenantTeamIndexer.execute(...args);
  });
};
