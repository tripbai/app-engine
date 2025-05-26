import { Route } from "../../interface"
import { AWSLambdaEvent } from "./event"

export class LambdaAdapter {

  /**
   * Converts Lambda Event data such as queryStringParameters, body, and
   * path parameters into key-value pair that can be injected into the
   * data fields of a Flow Packet
   * @param event - AWS Lambda Event 
   */
  static eventToFlowData(event:AWSLambdaEvent){
    let normalized = {}
    if ('queryStringParameters' in event) {
      for (const key in event.queryStringParameters) {
        normalized[key] = event.queryStringParameters[key]
      }
    }
    if ('body' in event) {
      const payloadBody = JSON.parse(event.body)
      for (const key in payloadBody) {
        normalized[key] = payloadBody[key]
      }
    }
    if ('pathParameters' in event) {
      for (const key in event.pathParameters) {
        normalized[key] = event.pathParameters[key]
      }
    }
    return normalized
  }

  /**
   * In an Lambda event, the resource path is referenced to the API Gateway. 
   * This method "re-creates" the resource path
   * @param method - HTTP Method
   * @param routePath - Route Path as referenced to AWS API Gateway
   * @returns 
   */
  static uriToResourcePath(method:string,routePath:string){
    let cRoutePath = routePath
    const regex = /:[a-zA-Z0-9_]+/g;
    const tokens = routePath.match(regex) ?? []
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const cToken = '{'+token.replace(/^:/, '')+'}'
      cRoutePath = cRoutePath.replace(token,cToken)
    }
    return method+' '+cRoutePath
  }


  static requestToEvent (
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    resourcePath: string,
    path: string,
    httpRequest: Route.Http.Request
  ): AWSLambdaEvent {
    let pathParameters = {}
    let queryParams  = {}
    if (httpRequest.params!==null) {
      pathParameters = httpRequest.params
    }
    if (httpRequest.query!==null) {
      queryParams = httpRequest.query
    }
    return {
      version: '2.0',
      routeKey: resourcePath,
      queryStringParameters: queryParams,
      pathParameters: pathParameters,
      requestContext: {
        http: {
          method: method,
          path: resourcePath,
          protocol: 'HTTP/1.1',
          sourceIp: httpRequest.clientIp,
          userAgent: httpRequest.userAgent
        },
        routeKey: resourcePath
      },
      body: JSON.stringify(httpRequest.body ?? {}),
      headers: {
        "x-requester-token": httpRequest.headers?.['x-requester-token'] ?? null
      }
    }
  }
}