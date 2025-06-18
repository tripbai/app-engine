import { Core } from "../../module/module"
import { AWSLambdaEvent } from "./lambda.types"

export class LambdaAdapter {

  /**
   * Transforms an AWS Lambda event into a flow data object. 
   * This is useful to normalize the data for further processing. 
   * The method extracts query parameters, body parameters, and path parameters from the event.
   * @param event 
   * @returns 
   */
  static eventToFlowData(event: AWSLambdaEvent){
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
   * by replacing the path parameters with the correct format.
   * This is useful to normalize the resource path for further processing.
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

  /**
   * For mocking purposes, this method transforms a HTTP request into an AWS Lambda event.
   * This is useful to simulate the behavior of an AWS Lambda function.
   * It creates an event object that contains the HTTP method, resource path, path parameters, query parameters, and body.
   * @param method 
   * @param resourcePath 
   * @param path 
   * @param httpRequest 
   * @returns 
   */
  static requestToEvent (
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    resourcePath: string,
    path: string,
    httpRequest: Core.Route.Http.Request
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