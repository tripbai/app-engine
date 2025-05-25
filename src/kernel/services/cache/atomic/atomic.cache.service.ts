import { CacheItem, CacheProviderInterface } from "../interface"

let CachedData = {}
let hasInitiated = false
export class AtomicCacheService implements CacheProviderInterface {
  client: {[key:string]:string|null}
  connect(): Promise<boolean> {
    return new Promise(async (resolve,reject)=>{
      if (!hasInitiated) {
        hasInitiated = true
        console.log('AtomicCacheService connected')
      }
      this.client = CachedData
      resolve(true)
    })
  }
  addItem({ collection, entityId }: CacheItem, cacheContent: string): Promise<string> {
    return new Promise(async (resolve,reject)=>{
      try {
        const key = `${collection}:${entityId}`
        this.client[key] = cacheContent
        resolve(cacheContent)
      } catch (error) {
        reject(error)
      }
    })
  }
  flushItem({ collection, entityId }: CacheItem): Promise<boolean> {
    return new Promise(async (resolve,reject)=>{
      try {
        const key = `${collection}:${entityId}`
        this.client[key] = null
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
  getItem({ collection, entityId }: CacheItem): Promise<string | null> {
    return new Promise(async (resolve,reject)=>{
      try {
        const key = `${collection}:${entityId}`
        resolve(this.client[key]??null)
      } catch (error) {
        reject(error)
      }
    })
  }
  getItems: (items:Array<CacheItem>) => Promise<(string | null)[]>;
  static dump(){
    return CachedData
  }
}