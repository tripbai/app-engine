import { Application } from "../application";
import { Core } from "../module/module";

export function post<T extends Core.Route.Endpoint.Schema & {request: {method: 'POST'}}>(path: T['request']['path']): any {
  return function(target,prop,descriptor){
    const Controller = target.constructor
    Application.route({
      path: path,
      method: 'POST',
      Controller: Controller,
      handler: prop
    })
  }
}

export function get<T extends Core.Route.Endpoint.Schema & {request: {method: 'GET'}}>(path: T['request']['path']): any {
  return function(target,prop,descriptor){
    const Controller = target.constructor
    Application.route({
      path: path,
      method: 'GET',
      Controller: Controller,
      handler: prop
    })
  }
}