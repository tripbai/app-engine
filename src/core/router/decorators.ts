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

export function patch<T extends Core.Route.Endpoint.Schema & {request: {method: 'PATCH'}}>(path: T['request']['path']): any {
  return function(target,prop,descriptor){
    const Controller = target.constructor
    Application.route({
      path: path,
      method: 'PATCH',
      Controller: Controller,
      handler: prop
    })
  }
}

export function put<T extends Core.Route.Endpoint.Schema & {request: {method: 'PUT'}}>(path: T['request']['path']): any {
  return function(target,prop,descriptor){
    const Controller = target.constructor
    Application.route({
      path: path,
      method: 'PUT',
      Controller: Controller,
      handler: prop
    })
  }
}

export function del<T extends Core.Route.Endpoint.Schema & {request: {method: 'DELETE'}}>(path: T['request']['path']): any {
  return function(target,prop,descriptor){
    const Controller = target.constructor
    Application.route({
      path: path,
      method: 'DELETE',
      Controller: Controller,
      handler: prop
    })
  }
}