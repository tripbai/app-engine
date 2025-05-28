import { AbstractCacheProvider, CacheItem } from "../cache.provider";

export class MockCacheProvider implements AbstractCacheProvider {
  async connect(): Promise<boolean> {
    return true
  }
  async getItem({ collection, entityId }: CacheItem): Promise<string | null> {
    return null
  }
  async getItems(items: CacheItem[]): Promise<(string | null)[]> {
    return []
  }
  async addItem({ collection, entityId }: CacheItem, cacheContent: string): Promise<string> {
    return ''
  }
  async flushItem({ collection, entityId }: CacheItem): Promise<boolean> {
    return true
  }
}