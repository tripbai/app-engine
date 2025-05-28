import { Core } from "../../core.types"

/**
 * A single cached item. It is defined by its id and the collection
 * where it belongs to.
 */
export type CacheItem = {
  collection: string,
  entityId: Core.Entity.Id
}

/**
 * @typedef {Object} CacheItem
 * @property {string} collection - the name of the object/entity collection 
 * @property {string} entityId - the id of the cache
 */

export abstract class AbstractCacheProvider {

  abstract connect():Promise<boolean>

  /**
   * Adds cache data to the cache directory
   * @param {CacheItem} 
   * @param cacheContent the data to be cache as a type of string
   */
  abstract addItem({collection, entityId}:CacheItem, cacheContent: string): Promise<string>

  /**
   * Deletes cached data
   * @param  
   *  collection: the name of the object/entity collection 
   *  cacheId: the id of the cache
   * 
   */
  abstract flushItem({collection, entityId}: CacheItem): Promise<boolean>  

  /**
   * Retrieves cached item
   * @param object 
   *  collection: the name of the object/entity collection 
   *  cacheId: the id of the cache
   */
  abstract getItem({collection, entityId}: CacheItem): Promise<string | null>

  /**
   * Retrieves multiple cache item
   * @param param0 
   * @returns 
   */
  abstract getItems:(items: Array<CacheItem>)=> Promise<Array<string | null>>
}