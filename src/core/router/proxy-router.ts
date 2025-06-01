import { injectable } from "inversify"
import { Core } from "../module/module"
import { RequesterIdentityMiddleware } from "../requester/requester-identity.middleware"

@injectable()
export class ProxyRouter {

  constructor(
    public readonly RequesterIdentityMiddleware: RequesterIdentityMiddleware
  ){}

  register<T extends Core.Route.Endpoint.Schema>(
    WebAppFramework: Core.Route.FrameworkInterface,
    uri: string,
    callback: Core.Route.Handler<T>,
    method: Core.Route.Http.Method
  ){
    const path = uri.split('?')[0]
    const lowerCased = method.toLowerCase()
    WebAppFramework[lowerCased](
      path,
      (request: Core.Route.Http.Request, response: Core.Route.Http.Response, next) => this.RequesterIdentityMiddleware.handle(request, response, next),
      async (request: Core.Route.Http.Request, response: Core.Route.Http.Response) => {
        try {
          const data: Core.Route.ControllerDTO<T> = {
            requester: request.requester,
            data: this.adapt<T>(request)
          }
          let result = await callback(data)
          response.status(200)
          response.json(result)
        } catch (error) {
          if (!('code' in error)) {
            error.code = 500
          }
          if (typeof error.code !== 'number') {
            error.code = 500
          }
          if (error.code>600||error.code<100) {
            error.code = 500
          }  
          response.status(error.code) 
          response.json({
            message: error.message ?? 'Internal server error'
          })  
      }
    })
  }

  private adapt<T extends Core.Route.Endpoint.Schema>(request: Core.Route.Http.Request){
    let normalized = {}
    const points = ['query','body','params','files']
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      if (!(point in request)) continue
      for (const key in request[point]) {
        normalized[key] = request[point][key]
      }
    }
    return normalized as Core.ExtractParams<T['request']['path']> &  T['request']['data']
  }

  
}