import { inject, injectable } from "inversify";
import { ResourceAccessForbiddenException } from "../exceptions/exceptions";
import * as Core from "../module/types";
import { JsonWebToken } from "../providers/jwt/jsonwebtoken/json-web-token.service";
import { AbstractJWTProvider } from "../providers/jwt/jwt.provider";
import { getEnv } from "../application/appEnv";

@injectable()
export class RequesterTokenService {
  issuer = "core/requester";

  constructor(
    @inject(AbstractJWTProvider)
    private JWTProvider: AbstractJWTProvider
  ) {}

  parse(requesterToken: string): { iss: string; aud: string; data: unknown } {
    let parsed: { iss: unknown; aud: unknown; data: unknown } | null = null;
    let message = "";
    try {
      parsed = this.JWTProvider.parse(getEnv("JWT_SECRET"), requesterToken);
    } catch (error) {
      message = error instanceof Error ? error.message : "unknown jwt error";
    }
    if (parsed == null) {
      throw new ResourceAccessForbiddenException({
        message: "parsing of JWT failed due to some reason",
        data: {
          error: { message: message },
        },
      });
    }
    if (!("iss" in parsed)) {
      throw new ResourceAccessForbiddenException({
        message: "missing issuer in requester token",
        data: { token: requesterToken },
      });
    }
    if (typeof parsed.iss !== "string") {
      throw new ResourceAccessForbiddenException({
        message: "invalid issuer type in requester token",
        data: { token: requesterToken },
      });
    }
    if (parsed.iss !== this.issuer) {
      throw new ResourceAccessForbiddenException({
        message: "mismatched issuer in requester token",
        data: { token: requesterToken },
      });
    }
    if (!("aud" in parsed)) {
      throw new ResourceAccessForbiddenException({
        message: "missing audience in requester token",
        data: { token: requesterToken },
      });
    }
    if (typeof parsed.aud !== "string") {
      throw new ResourceAccessForbiddenException({
        message: "invalid audience type in requester token",
        data: { token: requesterToken },
      });
    }
    return {
      iss: parsed.iss,
      aud: parsed.aud,
      data: parsed.data,
    };
  }

  generate(payload: {
    user: { id: string; status: Core.User.Status };
    permissions: Array<Core.Authorization.ConcreteToken>;
  }) {
    return this.JWTProvider.generate({
      secret: getEnv("JWT_SECRET"),
      untilMinutes: 30,
      data: payload,
      issuer: this.issuer,
      audience: payload.user.id,
    });
  }
}
