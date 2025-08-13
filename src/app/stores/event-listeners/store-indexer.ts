import { inject, injectable } from "inversify";
import { EventListenerInterface } from "../../../core/providers/event/event-manager.provider";
import { StoreCreatedEvent, StoreUpdatedEvent } from "../store.events";
import { AbstractIndexerProvider, IndexTaskItem } from "../../../core/providers/indexer/indexer.provider";
import { StoreModel } from "../store.model";
import { TripBai } from "../../module/module.interface";
import { AppENV } from "../../../core/helpers/env";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { Core } from "../../../core/module/module";

@injectable()
export class StoreIndexer implements EventListenerInterface<StoreCreatedEvent|StoreUpdatedEvent> {

  constructor(
    @inject(AbstractIndexerProvider) private readonly indexerProvider: AbstractIndexerProvider
  ){}

  async execute(storeModel: StoreModel) {

    const snippet: TripBai.Stores.Snippet = {
      name: storeModel.name,
      about: storeModel.about,
      organization_id: storeModel.organization_id,
      location_id: storeModel.location_id,
      profile_photo_src: storeModel.profile_photo_src,
      cover_photo_src: storeModel.cover_photo_src,
      status: storeModel.status
    }

    const indexerNamespaceId = AppENV.get('IAUTH_INDEXER_NAMESPACE_ID')
    EntityToolkit.Assert.idIsValid(indexerNamespaceId)

    const storeSnippetTask: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Snippet:Entity",
      entity_collection: "stores",
      entity_id: storeModel.entity_id,
      entity_snippet: snippet
    }

    const taskToIndexStoreToTenants: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Index:Add:Entity",
      entity_collection: "tenants",
      entity_id: storeModel.organization_id,
      index_name: "stores",
      subject_id: storeModel.entity_id
    }

    await this.indexerProvider.index([
      storeSnippetTask,
      taskToIndexStoreToTenants
    ])

  }

}