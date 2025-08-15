import { inject, injectable } from "inversify";
import * as Core from "../module/types";
import { RequesterIdentityFactory } from "./requester-identity.factory";

@injectable()
export class RequesterIdentityMiddleware {
  constructor(
    @inject(RequesterIdentityFactory)
    public readonly RequesterIdentityFactory: RequesterIdentityFactory
  ) {}

  handle(
    request: Core.Route.HttpRequest,
    response: Core.Route.HttpResponse,
    next: () => void
  ) {
    const token: string | null = request.headers["x-requester-token"] ?? null;

    try {
      request.requester = this.RequesterIdentityFactory.create({
        token: token,
        ipAddress: request.clientIp,
        userAgent: request.userAgent,
      });

      next();
      return;
    } catch (error) {
      if (!(error instanceof Error)) {
        response.status(500);
        response.json({
          message: "auth token validation failed",
        });
        return;
      }
      if (!("code" in error) || typeof error.code !== "number") {
        response.status(401);
        response.json({
          message: "auth token validation failed",
        });
        return;
      }
      response.status(error.code ?? 401);
      response.json({
        message:
          error.message ?? "The token provided is either invalid or expired",
      });
    }
  }
}
