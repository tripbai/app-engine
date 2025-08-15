import { inject, injectable } from "inversify";
import { CertifyTenantAccessCommand } from "../commands/certify-tenant-access.command";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class TenantAccessCertificationController {
  constructor(
    @inject(CertifyTenantAccessCommand)
    private readonly certifyTenantAccessCommand: CertifyTenantAccessCommand
  ) {}

  @post<IdentityAuthority.Tenants.Endpoints.CertifyAccess>(
    "/identity-authority/tenants/:tenant_id/certify-access"
  )
  async certifyTenantAccess<
    T extends IdentityAuthority.Tenants.Endpoints.CertifyAccess
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertNonEmptyString(params.data.tenant_id);
      assertValidEntityId(params.data.tenant_id);
    } catch (error) {
      throw new BadRequestException({
        message: "failed to certify tenant access due to an invalid input",
        data: { error: error },
      });
    }
    const token = await this.certifyTenantAccessCommand.execute(
      params.requester,
      params.data.tenant_id
    );
    return {
      access_certification_token: token,
    };
  }
}
