export namespace RedisServiceProvider {
  export namespace Endpoints {
    export namespace Private {
      export type FlushCache = {
        request: {
          path: '/kernel/application/redis/cache/flush',
          method: 'POST',
          data: {}
        }
        response: {}
      }
    }
  }
}