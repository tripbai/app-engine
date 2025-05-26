import { AppPermissionsValidator } from "../../../auth/app-permissions.validators"
import { Route } from "../../../interface"
import { RedisCacheService } from "../../cache/redis/redis.cache.service"
import { RedisServiceProvider } from "../interface"

export const FlushRedisCachePrivately: Route.Handler<RedisServiceProvider.Endpoints.Private.FlushCache> = (params) => {
  return new Promise (async (resolve,reject) => {
    try {
      AppPermissionsValidator.isHighest(params.requester)
      const RedisCache = new RedisCacheService()
      await RedisCache.connect() 
      await RedisCache.flushAll()
      resolve({})
    } catch (error) {
      reject(error)
    }
  })
}