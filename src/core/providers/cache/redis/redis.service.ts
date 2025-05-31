import { injectable } from "inversify"
import { Core } from "../../../core.types"
import { GenericServiceProviderException } from "../../../exceptions/exceptions"
import { AppENV } from "../../../helpers/env"
import { AppLogger } from "../../../helpers/logger"
import { AbstractCacheProvider, CacheItem } from "../cache.provider"
import { createClient } from 'redis'

/**
 * RedisCacheService is a service class that provides caching functionality using Redis as the backend.
 * This class implements the CacheProviderInterface, ensuring compatibility with a standard set of 
 * caching operations as defined by the Kernel.
 */
@injectable()
export class RedisCacheService implements AbstractCacheProvider {

  client: ReturnType<typeof createClient>

  /**
   * Creates a new connection
   * @returns 
   */
  connect(): Promise<boolean>{
    return new Promise(async (resolve,reject)=>{
      if (RedisClient === null) {
        RedisClient = createClient({
          password: AppENV.get('REDIS_PASSWORD'),
          socket: {
            host: AppENV.get('REDIS_SOCKET_HOST'),
            port: parseInt(AppENV.get('REDIS_SOCKET_PORT'))
          }
        })
        RedisClient.on('error', error =>{
          AppLogger.error({
            message: 'redis connection failed due to error',
            severity: 2,
            data: {error: error}
          })
        })
        await RedisClient.connect()
        AppLogger.info('Redis Client connected')
      }
      this.client = RedisClient
      resolve(true)
    })
  }

  /**
   * Adds item to cache
   * @param param0 
   * @param cacheContent 
   * @returns 
   */
  addItem({ collection, entityId }: CacheItem, cacheContent: string): Promise<string> {
    return new Promise(async (resolve,reject)=>{
      try {
        const key = createRedisKey(collection,entityId)
        await this.client.set(key,cacheContent)
        resolve(cacheContent)
      } catch (error) {
        reject(new GenericServiceProviderException({
          message: 'failed to add item to redis',
          severity: 2,
          data: {error: error}
        }))
      }
    })
  }

  /**
   * Flush item cache
   * @param param0 
   * @returns 
   */
  flushItem({ collection, entityId }: CacheItem): Promise<boolean> {
    return new Promise(async (resolve,reject)=>{
      try {
        const key = createRedisKey(collection,entityId)
        await this.client.del(key)
        resolve(true)
      } catch (error) {
        reject(new GenericServiceProviderException({
          message: 'failed to flush item from redis',
          severity: 2,
          data: {error: error}
        }))
      }
    })
  }

  /**
   * Retrieves cache item
   * @param param0 
   * @returns 
   */
  getItem({ collection, entityId }: CacheItem): Promise<string|null> {
    return new Promise(async (resolve,reject)=>{
      try {
        const key = createRedisKey(collection,entityId)
        resolve(await this.client.get(key))
      } catch (error) {
        reject(new GenericServiceProviderException({
          message: 'failed to get item from redis',
          severity: 2,
          data: {error: error}
        }))
      }
    })
  }

  /**
   * Retrieves multiple cached items
   * @param items 
   * @returns 
   */
  getItems(items:Array<CacheItem>): Promise<Array<string|null>>  {
    return new Promise(async (resolve,reject)=>{
      try {
        const keys = items.map(item=>createRedisKey(item.collection,item.entityId))
        const data = await this.client.mGet(keys)
        resolve(data)
      } catch (error) {
        reject(new GenericServiceProviderException({
          message: 'failed to retrieve multiple items from redis',
          severity: 2,
          data: {error: error}
        }))
      }
    })
  }

  /**
   * Flush all cached data
   * @returns 
   */
  flushAll():Promise<boolean>{
    return new Promise(async (resolve,reject)=>{
      try {
        await this.client.flushAll()
        resolve(true)
      } catch (error) {
        reject(new GenericServiceProviderException({
          message: 'failed to flush all items from redis',
          severity: 2,
          data: {error: error}
        }))
      }
    })
  }

}

/**
 * RedisClientType, which represents a single 
 * Redis client
 */
let RedisClient: ReturnType<typeof createClient> | null = null

/** 
 * Creates Redis cache key, which is just a combination 
 * of collection and entity id
 */
const createRedisKey = (
  collection: string,
  entityId: Core.Entity.Id
): string => {
  return `${collection}:${entityId}`
}

export type RedisConfigType = {
  SOCKET_HOST: string
  SOCKET_PORT: number
  PASSWORD: string
}