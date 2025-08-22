import { inject, injectable } from "inversify";
import { UserModel } from "../../users/user.model";
import { AbstractJWTProvider } from "../../../core/providers/jwt/jwt.provider";
import { TenantModel } from "../tenant.model";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { TenantUsersRegistry } from "../../teams/tenant-users.registry";
import { TeamRepository } from "../../teams/team.repository";
import { UserAccessRegistry } from "../../teams/user-access.registry";
import * as IdentityAuthority from "../../module/types";
import { getEnv } from "../../../core/application/appEnv";

@injectable()
export class TenantAccessCertificationService {
  constructor(
    @inject(AbstractJWTProvider)
    private abstractJwtProvider: AbstractJWTProvider,
    @inject(TenantUsersRegistry)
    private tenantUsersRegistry: TenantUsersRegistry,
    @inject(UserAccessRegistry)
    private userAccessRegistry: UserAccessRegistry
  ) {}

  async generateToken(userModel: UserModel, tenantModel: TenantModel) {
    if (userModel.status !== "active" && userModel.status !== "unverified") {
      throw new ResourceAccessForbiddenException({
        message:
          "unable to generate tenant access certification token due to user status",
        data: {
          user_id: userModel.entity_id,
          tenant_id: tenantModel.entity_id,
        },
      });
    }
    if (
      !this.userAccessRegistry.canUserAccessTenant({
        userId: userModel.entity_id,
        tenantId: tenantModel.entity_id,
      })
    ) {
      throw new ResourceAccessForbiddenException({
        message:
          "user must be a member of tenant to generate access certification",
        data: {
          tenant_id: tenantModel.entity_id,
          user_id: userModel.entity_id,
        },
      });
    }
    const issuer: IdentityAuthority.Tenants.CertificationTokenData.Issuer =
      "identity-authority:tenant-access-certifier";
    const payload: IdentityAuthority.Tenants.CertificationTokenData.Data = {
      tenant_id: tenantModel.entity_id,
      user_id: userModel.entity_id,
      is_owner: await this.userAccessRegistry.isUserOwnerOfTenant({
        userId: userModel.entity_id,
        tenantId: tenantModel.entity_id,
      }),
      tenant_permissions: [],
    };
    return this.abstractJwtProvider.generate({
      issuer: issuer,
      audience: tenantModel.entity_id,
      data: payload,
      untilMinutes: this.getTokenExpiry(),
      secret: getEnv("SECRET_KEY"),
    });
  }

  getTokenExpiry(): number {
    return 60; /** 60 minutes */
  }
}
