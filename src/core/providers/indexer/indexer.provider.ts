import { Core } from "../../module/module"

export abstract class AbstractIndexerProvider {
  abstract index(tasks: Array<IndexTaskItem>): Promise<void>
}

/**
 * Task interface for Kryptolib indexer
 * @WARNING DO NOT USE fields that may produce different values at a
 * given time, such as `created_at`, `updated_at` or any `timestamp`
 * related fields. We are MD5 hashing these values that will serve
 * as a `deduplication_id` to notification providers. We need to 
 * be able to produce the same MD5 hash value, regardless of the 
 * time it is generated. 
 */
export type IndexTaskItem = {
  namespace_id: Core.Entity.Id
  type: 'Activate:Entity',
  entity_collection: string,
  entity_id: Core.Entity.Id
} | {
  namespace_id: Core.Entity.Id
  type: 'Index:Add:Entity',
  entity_collection: string,
  entity_id: Core.Entity.Id,
  index_name: string,
  subject_id: Core.Entity.Id | string
} | {
  namespace_id: Core.Entity.Id
  type: 'Deactivate:Entity',
  entity_collection: string,
  entity_id: Core.Entity.Id
} | {
  namespace_id: Core.Entity.Id
  type: 'Index:Remove:Entity',
  entity_collection: string,
  entity_id: Core.Entity.Id,
  index_name: string,
  subject_id: Core.Entity.Id | string
} | {
  namespace_id: Core.Entity.Id
  type: 'Snippet:Entity',
  entity_collection: string,
  entity_id: Core.Entity.Id,
  entity_snippet: {[key:string]:any}
}