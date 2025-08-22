import { inject, injectable } from "inversify";
import { EventListenerInterface } from "../../../core/providers/event/event-manager.provider";
import { TenantCreateEvent, TenantUpdateEvent } from "../tenant.events";
import { TenantModel } from "../tenant.model";
import {
  AbstractIndexerProvider,
  IndexTaskItem,
} from "../../../core/providers/indexer/indexer.provider";
import { getEnv } from "../../../core/application/appEnv";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class TenantSnippetIndexer
  implements EventListenerInterface<TenantCreateEvent | TenantUpdateEvent>
{
  constructor(
    @inject(AbstractIndexerProvider)
    private readonly indexerProvider: AbstractIndexerProvider
  ) {}

  async execute(tenantModel: TenantModel) {
    const indexerNamespaceId = getEnv("IAUTH_INDEXER_NAMESPACE_ID");
    assertValidEntityId(indexerNamespaceId);

    const tenantSnippetTask: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Snippet:Entity",
      entity_collection: "tenants",
      entity_id: tenantModel.entity_id,
      entity_snippet: {
        name: tenantModel.name,
        profile_photo: tenantModel.profile_photo ?? null,
        cover_photo: tenantModel.cover_photo ?? null,
        archived_at: tenantModel.archived_at ?? null,
      },
    };

    await this.indexerProvider.index([tenantSnippetTask]);
  }
}
