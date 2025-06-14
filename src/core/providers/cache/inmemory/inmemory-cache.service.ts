import { AbstractCacheProvider, CacheItem } from "../cache.provider"

export class InMemoryCacheService implements AbstractCacheProvider {

  private cache: Map<string, Map<string, string>> = new Map()

  async connect(): Promise<boolean> {
    return true
  }

  async addItem({ collection, entityId }: CacheItem, cacheContent: string): Promise<string> {
    if (!this.cache.has(collection)) {
      this.cache.set(collection, new Map())
    }

    const collectionCache = this.cache.get(collection)!
    // Store a copy
    collectionCache.set(entityId, `${cacheContent}`)
    return `${cacheContent}`
  }

  async flushItem({ collection, entityId }: CacheItem): Promise<boolean> {
    const collectionCache = this.cache.get(collection)
    if (!collectionCache) return false
    return collectionCache.delete(entityId)
  }

  async getItem({ collection, entityId }: CacheItem): Promise<string | null> {
    const collectionCache = this.cache.get(collection)
    if (!collectionCache) return null

    const cachedValue = collectionCache.get(entityId)
    // Return a copy if it exists
    return cachedValue != null ? `${cachedValue}` : null
  }

  async getItems(items: Array<CacheItem>): Promise<Array<string | null>> {
    return items.map(({ collection, entityId }) => {
      const collectionCache = this.cache.get(collection)
      const cachedValue = collectionCache?.get(entityId) ?? null
      return cachedValue != null ? `${cachedValue}` : null
    })
  }
}