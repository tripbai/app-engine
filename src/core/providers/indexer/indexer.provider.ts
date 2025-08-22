import * as Core from "../../module/types";

/**
 * AbstractIndexerProvider is an abstract class that defines the
 * contract for indexer providers in the system. It requires the
 * implementation of an `index` method that takes an array
 * of `IndexTaskItem` objects and returns a Promise.
 *
 * We use this to pre-index entities in the system, such as users,
 * profiles, and other entities that need to be indexed for
 * searching and retrieval purposes.
 */
export abstract class AbstractIndexerProvider {
  abstract index(tasks: Array<IndexTaskItem>): Promise<void>;
}

/**
 * @WARNING DO NOT USE fields that may produce different values at a
 * given time, such as `created_at`, `updated_at` or any `timestamp`
 * related fields. We are MD5 hashing these values that will serve
 * as a `deduplication_id` to notification providers. We need to
 * be able to produce the same MD5 hash value, regardless of the
 * time it is generated.
 */
export type IndexTaskItem =
  | {
      namespace_id: Core.Entity.Id;
      type: "Activate:Entity";
      entity_collection: string;
      entity_id: Core.Entity.Id;
    }
  | {
      namespace_id: Core.Entity.Id;
      type: "Index:Add:Entity";
      entity_collection: string;
      entity_id: Core.Entity.Id;
      index_name: string;
      subject_id: Core.Entity.Id | string;
    }
  | {
      namespace_id: Core.Entity.Id;
      type: "Deactivate:Entity";
      entity_collection: string;
      entity_id: Core.Entity.Id;
    }
  | {
      namespace_id: Core.Entity.Id;
      type: "Index:Remove:Entity";
      entity_collection: string;
      entity_id: Core.Entity.Id;
      index_name: string;
      subject_id: Core.Entity.Id | string;
    }
  | {
      namespace_id: Core.Entity.Id;
      type: "Snippet:Entity";
      entity_collection: string;
      entity_id: Core.Entity.Id;
      entity_snippet: { [key: string]: any };
    };
