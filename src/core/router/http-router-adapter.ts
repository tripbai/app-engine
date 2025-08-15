import { inject, injectable } from "inversify";
import * as Core from "../module/types";
import { RequesterIdentityMiddleware } from "../requester/requester-identity.middleware";
import { GenericErrorMessage } from "./generic-error-message";

@injectable()
export class HttpRouterAdapter {
  constructor(
    @inject(RequesterIdentityMiddleware)
    private requesterIdentityMiddleware: RequesterIdentityMiddleware,
    @inject(GenericErrorMessage)
    private genericErrorMessage: GenericErrorMessage
  ) {}

  /**
   * Registers a route to the web app framework (example: Express)
   * @param webAppFramework
   * @param uri
   * @param routeHandler
   * @param method
   */
  register<T extends Core.Route.EndpointSchema>(
    webAppFramework: Core.Route.FrameworkInterface,
    apiPath: string,
    apiMethod: Core.Route.HttpMethod,
    controllerMethod: Core.Route.Handler<T>
  ) {
    const cleanedUpPath = apiPath.split("?")[0];
    const lowerCasedMethod = apiMethod.toLowerCase();
    this.assertMethodIsHttpVerb(lowerCasedMethod);
    webAppFramework[lowerCasedMethod](
      cleanedUpPath,
      this.getAuthMiddleware(),
      async (
        request: Core.Route.HttpRequest,
        response: Core.Route.HttpResponse
      ) => {
        try {
          const controllerDto = this.createControllerDto<T>(request);
          let result = await controllerMethod(controllerDto);
          response.status(200);
          response.json(result);
        } catch (error) {
          if (!(error instanceof Error)) {
            response.status(500);
            response.json({
              message: this.genericErrorMessage.getByCode(500),
            });
            return;
          }
          let errorCode = 500;
          if (
            "code" in error &&
            typeof error.code === "number" &&
            error.code < 600 &&
            error.code > 100
          ) {
            errorCode = error.code;
          }
          const message = this.genericErrorMessage.getByCode(errorCode);
          response.status(errorCode);
          response.json({ message });
        }
      }
    );
  }

  createControllerDto<T extends Core.Route.EndpointSchema>(
    request: Core.Route.HttpRequest
  ) {
    const data: Core.Route.ControllerDTO<T> = {
      requester: request.requester,
      data: this.normalizeRequestData<T>(request),
    };
    return data;
  }

  assertMethodIsHttpVerb(
    value: string
  ): asserts value is "get" | "post" | "put" | "patch" | "delete" {
    if (
      value !== "get" &&
      value !== "post" &&
      value !== "put" &&
      value !== "delete" &&
      value !== "patch"
    ) {
      throw new Error(`Method ${value} is not valid`);
    }
  }

  getAuthMiddleware() {
    return (
      request: Core.Route.HttpRequest,
      response: Core.Route.HttpResponse,
      next: () => void
    ) => {
      return this.requesterIdentityMiddleware.handle(request, response, next);
    };
  }

  private normalizeRequestData<T extends Core.Route.EndpointSchema>(
    request: Core.Route.HttpRequest
  ) {
    let normalized: { [key: string]: any } = {};
    const fields = ["query", "body", "params", "files"];
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i] as "query" | "body" | "params" | "files";
      if (!(field in request)) continue;
      for (const key in request[field]) {
        normalized[key] = request[field][key];
      }
    }
    return normalized as Core.Route.ExtractParams<T["request"]["path"]> &
      T["request"]["data"];
  }
}
