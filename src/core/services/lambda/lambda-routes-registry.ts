import * as Core from "../../module/types";
import { LambdaAdapter } from "./lambda-adapter";

const registry: Map<string, Core.Route.Handler<any>> = new Map();

/**
 * Routes declared in the routes decorator gets registered in this object.
 * For each request, the application will perform a lookup to find
 * a matching "Resource Path"
 */
export class LambdaRoutesRegistry {
  static register<T extends Core.Route.EndpointSchema>(
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
    uri: string,
    callback: Core.Route.Handler<T>
  ): void {
    const rsPath = LambdaAdapter.uriToResourcePath(method, uri.split("?")[0]);
    if (!registry.has(rsPath)) {
      registry.set(rsPath, callback);
    }
  }
  static lookup<T extends Core.Route.EndpointSchema>(
    rsPath: string
  ): Core.Route.Handler<T> | null {
    return registry.get(rsPath) ?? null;
  }
}
