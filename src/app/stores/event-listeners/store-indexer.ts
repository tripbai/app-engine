import { inject, injectable } from "inversify";
import { EventListenerInterface } from "../../../core/providers/event/event-manager.provider";
import { StoreCreatedEvent, StoreUpdatedEvent } from "../store.events";
import {
  AbstractIndexerProvider,
  IndexTaskItem,
} from "../../../core/providers/indexer/indexer.provider";
import { StoreModel } from "../store.model";
import * as TripBai from "../../module/types";
import * as Core from "../../../core/module/types";
import { getEnv } from "../../../core/application/appEnv";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class StoreIndexer
  implements EventListenerInterface<StoreCreatedEvent | StoreUpdatedEvent>
{
  constructor(
    @inject(AbstractIndexerProvider)
    private readonly indexerProvider: AbstractIndexerProvider
  ) {}

  async execute(storeModel: StoreModel) {
    const snippet: TripBai.Stores.Snippet = {
      name: storeModel.name,
      about: storeModel.about,
      organization_id: storeModel.organization_id,
      location_id: storeModel.location_id,
      profile_photo_src: storeModel.profile_photo_src,
      cover_photo_src: storeModel.cover_photo_src,
      status: storeModel.status,
    };

    const indexerNamespaceId = getEnv("IAUTH_INDEXER_NAMESPACE_ID");
    assertValidEntityId(indexerNamespaceId);

    const storeSnippetTask: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Snippet:Entity",
      entity_collection: "stores",
      entity_id: storeModel.entity_id,
      entity_snippet: snippet,
    };

    const taskToIndexStoreToTenants: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Index:Add:Entity",
      entity_collection: "tenants",
      entity_id: storeModel.organization_id,
      index_name: "stores",
      subject_id: storeModel.entity_id,
    };

    await this.indexerProvider.index([
      storeSnippetTask,
      taskToIndexStoreToTenants,
    ]);
  }
}
