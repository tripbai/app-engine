import { inject, injectable } from "inversify";
import * as IdentityAuthority from "../../../identity-authority/module/types";
import { AbstractJWTProvider } from "../../../core/providers/jwt/jwt.provider";
import { getEnv } from "../../../core/application/appEnv";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class OrganizationIAuthTokenService {
  constructor(
    @inject(AbstractJWTProvider)
    private jwtProvider: AbstractJWTProvider
  ) {}

  async parseToken(token: string) {
    const payload = this.jwtProvider.parse(getEnv("SECRET_KEY"), token);
    const expectedIssuer: IdentityAuthority.Tenants.CertificationTokenData.Issuer =
      "identity-authority:tenant-access-certifier";
    if (payload.iss !== expectedIssuer) {
      throw new Error("Invalid token issuer");
    }
    if (payload.data === undefined) {
      throw new Error("Invalid token data");
    }
    if (typeof payload.data !== "object" || payload.data === null) {
      throw new Error("Invalid token data format");
    }
    if (!("tenant_id" in payload.data)) {
      throw new Error("Missing tenant ID in token data");
    }
    if (
      typeof payload.data.tenant_id !== "string" ||
      payload.data.tenant_id === ""
    ) {
      throw new Error("Invalid tenant ID in token data");
    }
    assertValidEntityId(payload.data.tenant_id);
    if (!("user_id" in payload.data)) {
      throw new Error("Missing user ID in token data");
    }
    if (
      typeof payload.data.user_id !== "string" ||
      payload.data.user_id === ""
    ) {
      throw new Error("Invalid user ID in token data");
    }
    assertValidEntityId(payload.data.user_id);
    if (!("is_owner" in payload.data)) {
      throw new Error("Missing is_owner flag in token data");
    }
    if (typeof payload.data.is_owner !== "boolean") {
      throw new Error("Invalid is_owner flag in token data");
    }
    if (!("tenant_permissions" in payload.data)) {
      throw new Error("Missing tenant_permissions in token data");
    }
    if (!Array.isArray(payload.data.tenant_permissions)) {
      throw new Error("Invalid tenant_permissions format in token data");
    }
    return {
      tenant_id: payload.data.tenant_id,
      user_id: payload.data.user_id,
      is_owner: payload.data.is_owner,
      tenant_permissions: payload.data.tenant_permissions,
    };
  }
}
