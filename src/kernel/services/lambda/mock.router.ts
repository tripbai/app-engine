import { Route } from "../../interface"
import { LambdaAdapter } from "./adapter"
import { AWSLambdaEvent } from "./event"
import { router } from "./router"

/**
 * This Router object sits on top of the Route Framework, built to
 * handle processing in order to convert the request into an event-lik
 * similar to Lambda Event
 */
export class LambdaMockRouter implements Route.ProxyInterface {
  app: Route.FrameworkInterface 
  constructor(app:Route.FrameworkInterface){
    this.app = app
  }
  get(uri:string){
    const path = uri.split('?')[0]
    return handleRoute(this.app,path,'GET')
  }
  post(uri:string){
    const path = uri.split('?')[0]
    return handleRoute(this.app,path,'POST')
  }
  put(uri:string){
    const path = uri.split('?')[0]
    return handleRoute(this.app,path,'PUT')
  }
  patch(uri:string){
    const path = uri.split('?')[0]
    return handleRoute(this.app,path,'PATCH')
  }
  delete(uri:string){
    const path = uri.split('?')[0]
    return handleRoute(this.app,path,'DELETE')
  }
}

/**
 * This method registers all the routes to RouterFrameworks such as 
 * Express, etc.
 * @param app - The Router Framework (example: Express)
 * @param uri - Route URI
 * @param method - HTPP Method
 */
const handleRoute=(
  app: Route.FrameworkInterface,
  uri: string,
  method: 'GET'|'POST'|'PATCH'|'PUT'|'DELETE'
):void=>{
  const lowerCased = method.toLowerCase()
  app[lowerCased](uri,async (request:Route.Http.Request,response:Route.Http.Response)=>{
    try {
      const rsPath        = LambdaAdapter.uriToResourcePath(method,uri)
      const lambdaEvent   = LambdaAdapter.requestToEvent(method,rsPath,uri,request)
      const eventResponse = await handleEvent(lambdaEvent)
      
      response.status(eventResponse.statusCode)
      response.json(JSON.parse(eventResponse.body))
    } catch (error) {
      response.status(error.code ?? 500) 
      response.json({message: error.message ?? 'Internal server error'})
    }
  })
}


export const handleEvent=(
  event:AWSLambdaEvent
):Promise<{statusCode:number,body:string}> => {
  return new Promise(async (resolve,reject)=>{
    try {
      const rootDir  = global.APP_ROOT
      const response = await router(event)
      resolve({
        statusCode: response.code,
        body: JSON.stringify(response.data)
      })
    } catch (error) {
      resolve({
        statusCode: error.code ?? 500,
        body: JSON.stringify({ error: error.message ?? 'unknown exception' }),
      })
    }
  })
}
