import { Application } from "../application";
import { Core } from "../core.types";

export function post<T extends Core.Route.Endpoint.Schema & {request: {method: 'POST'}}>(path: T['request']['path']): any {
  return function(target,prop,descriptor){
    const className = target.constructor.name
    Application.route({
      path: path,
      method: 'POST',
      className: className,
      handler: prop
    })
  }
}