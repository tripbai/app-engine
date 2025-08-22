import { registerRoute } from "../application/routeRegistry";
import * as Core from "../module/types";

export function post<
  T extends Core.Route.EndpointSchema & { request: { method: "POST" } }
>(path: T["request"]["path"]): PropertyDecorator {
  return function (target, propertyKey) {
    const Controller = target.constructor;
    registerRoute({
      path: path,
      method: "POST",
      Controller: Controller,
      handler: propertyKey as string,
    });
  };
}

export function get<
  T extends Core.Route.EndpointSchema & { request: { method: "GET" } }
>(path: T["request"]["path"]): PropertyDecorator {
  return function (target, propertyKey) {
    const Controller = target.constructor;
    registerRoute({
      path: path,
      method: "GET",
      Controller: Controller,
      handler: propertyKey as string,
    });
  };
}

export function patch<
  T extends Core.Route.EndpointSchema & { request: { method: "PATCH" } }
>(path: T["request"]["path"]): PropertyDecorator {
  return function (target, propertyKey) {
    const Controller = target.constructor;
    registerRoute({
      path: path,
      method: "PATCH",
      Controller: Controller,
      handler: propertyKey as string,
    });
  };
}

export function put<
  T extends Core.Route.EndpointSchema & { request: { method: "PUT" } }
>(path: T["request"]["path"]): PropertyDecorator {
  return function (target, propertyKey) {
    const Controller = target.constructor;
    registerRoute({
      path: path,
      method: "PUT",
      Controller: Controller,
      handler: propertyKey as string,
    });
  };
}

export function del<
  T extends Core.Route.EndpointSchema & { request: { method: "DELETE" } }
>(path: T["request"]["path"]): PropertyDecorator {
  return function (target, propertyKey) {
    const Controller = target.constructor;
    registerRoute({
      path: path,
      method: "DELETE",
      Controller: Controller,
      handler: propertyKey as string,
    });
  };
}
