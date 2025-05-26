import { routes } from "../../../routes"
import { RecordNotFoundException } from "../../exceptions/exceptions"
import { Requester, Route } from "../../interface"
import { RequesterFactory } from "../../rbac/factory"
import { PublicRequester } from "../../rbac/requester"
import { RequesterToken } from "../../rbac/token"
import { LambdaAdapter } from "./adapter"
import { AWSLambdaEvent } from "./event"

/**
 * Routes declared in the routes.ts gets registered in this object.
 * For each request, the application will perform a lookup to find
 * a matching "Resource Path"
 */
class RoutesRegistry implements Route.ProxyInterface {
  private registry:{[key:string]:Route.Handler<any>}
  constructor(){
    this.registry = {}
  }
  get<T extends Route.Endpoint.Schema>(uri:string,callback:Route.Handler<T>):void{
    const rsPath = LambdaAdapter.uriToResourcePath('GET',uri.split('?')[0])
    this.registry[rsPath] = callback
  }
  post<T extends Route.Endpoint.Schema>(uri:string,callback:Route.Handler<T>):void{
    const rsPath = LambdaAdapter.uriToResourcePath('POST',uri.split('?')[0])
    this.registry[rsPath] = callback
  }
  put<T extends Route.Endpoint.Schema>(uri:string,callback:Route.Handler<T>):void{
    const rsPath = LambdaAdapter.uriToResourcePath('PUT',uri.split('?')[0])
    this.registry[rsPath] = callback
  }
  patch<T extends Route.Endpoint.Schema>(uri:string,callback:Route.Handler<T>):void{
    const rsPath = LambdaAdapter.uriToResourcePath('PATCH',uri.split('?')[0])
    this.registry[rsPath] = callback
  }
  delete<T extends Route.Endpoint.Schema>(uri:string,callback:Route.Handler<T>):void{
    const rsPath = LambdaAdapter.uriToResourcePath('DELETE',uri.split('?')[0])
    this.registry[rsPath] = callback
  }
  lookup<T extends Route.Endpoint.Schema>(rsPath:string): Route.Handler<T>|null{
    return this.registry[rsPath] ?? null
  }
}

export const router = (event:AWSLambdaEvent):Promise<{code:number,data:{[key:string]:any}}>  => {
  return new Promise(async (resolve,reject)=>{
    try {

      let Requester: Requester | null = null
      const token  = event.headers['x-requester-token'] ?? null

      Requester = RequesterFactory.create({
        token: token,
        ipAddress: event.requestContext.http.sourceIp,
        userAgent: event.requestContext.http.userAgent
      })

      let routeData: Route.Data<any> = {
        data: LambdaAdapter.eventToFlowData(event),
        requester: Requester
      }
      
      const resourcePath = event.requestContext.routeKey

      const Registry = new RoutesRegistry()
      routes(Registry)

      const callback = Registry.lookup(resourcePath)
      if (callback === null) {
        throw new RecordNotFoundException({
          message: 'callback was not matched to any route handler',
          data: {}
        })
      }
      const response = await callback(routeData)
      resolve({
        code: 200,
        data: response
      })
    } catch (error) {
      reject(error)
    }
  })
}