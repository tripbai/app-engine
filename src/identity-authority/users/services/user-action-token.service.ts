import { inject, injectable } from "inversify";
import * as Core from "../../../core/module/types";
import * as IdentityAuthority from "../../module/types";
import { AbstractJWTProvider } from "../../../core/providers/jwt/jwt.provider";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import { assertIsEmailAddress } from "../user.assertions";
import { getEnv } from "../../../core/application/appEnv";

export type UserActionTokenPayload =
  | {
      action: "password:reset_confirmation";
      user_id: Core.Entity.Id;
    }
  | {
      action: "email_address:confirmation_token";
      user_id: Core.Entity.Id;
      new_email_address: IdentityAuthority.Users.Fields.EmailAddress;
    }
  | {
      action: "account:verification_token";
      user_id: Core.Entity.Id;
    };

@injectable()
export class UserActionTokenService {
  private issuer = "identity-authority:actions";

  constructor(
    @inject(AbstractJWTProvider)
    private abstractJwtProvider: AbstractJWTProvider
  ) {}

  generate(payload: UserActionTokenPayload) {
    return this.abstractJwtProvider.generate<UserActionTokenPayload>({
      issuer: this.issuer,
      audience: payload.user_id,
      data: payload,
      untilMinutes: this.getTokenExpiryPerAction(payload),
      secret: getEnv("SECRET_KEY"),
    });
  }

  getTokenExpiryPerAction(payload: UserActionTokenPayload): number {
    if (payload.action === "password:reset_confirmation") {
      return 60; /** 60 minutes */
    }
    if (payload.action === "account:verification_token") {
      return 60 * 12; /** Half-day  */
    }
    return 60 * 24; /** 1 full day */
  }

  parse(userId: Core.Entity.Id, token: string): UserActionTokenPayload {
    const parsedToken = this.abstractJwtProvider.parse(
      getEnv("SECRET_KEY"),
      token
    );
    if (typeof parsedToken.iss !== "string") {
      throw new Error("invalid user action token: missing issuer");
    }
    if (parsedToken.iss !== this.issuer) {
      throw new Error("invalid user action token: issuer mismatch");
    }
    if (typeof parsedToken.aud !== "string") {
      throw new Error("invalid user action token: missing audience");
    }
    if (typeof parsedToken.aud !== userId) {
      throw new Error("invalid user action token: audience mismatch");
    }
    if (typeof parsedToken.data !== "object") {
      throw new Error("invalid user action token: missing data");
    }
    if (parsedToken.data === null) {
      throw new Error("invalid user action token: missing data");
    }
    const payload = parsedToken.data;
    if (
      "action" in payload &&
      payload.action === "password:reset_confirmation"
    ) {
      if ("user_id" in payload) {
        assertValidEntityId(payload.user_id);
        return {
          action: "password:reset_confirmation",
          user_id: payload.user_id,
        };
      }
    }
    if (
      "action" in payload &&
      payload.action === "email_address:confirmation_token"
    ) {
      if ("user_id" in payload && "email_address" in payload) {
        assertValidEntityId(payload.user_id);
        assertIsEmailAddress(payload.email_address);
        return {
          action: "email_address:confirmation_token",
          user_id: payload.user_id,
          new_email_address: payload.email_address,
        };
      }
    }
    if (
      "action" in payload &&
      payload.action ===
        "email_address:confirmation_tokenaccount:verification_token"
    ) {
      if ("user_id" in payload) {
        assertValidEntityId(payload.user_id);
        return {
          action: "account:verification_token",
          user_id: payload.user_id,
        };
      }
    }
    throw new Error("invalid user action: invalid payload type");
  }
}
