import { inject, injectable } from "inversify";
import { AddTenantUserCommand } from "../commands/add-tenant-user.command";
import { RemoveTenantUserCommand } from "../commands/remove-tenant-user.command";
import { del, post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { assertNonEmptyString } from "../../../core/utilities/assertValid";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class TenantAccessController {
  constructor(
    @inject(AddTenantUserCommand)
    private readonly addTenantUserCommand: AddTenantUserCommand,
    @inject(RemoveTenantUserCommand)
    private readonly removeTenantUserCommand: RemoveTenantUserCommand
  ) {}

  @post<IdentityAuthority.Tenants.Endpoints.AddUserToTeam>(
    "/identity-authority/tenants/:tenant_id/team/users"
  )
  async addUserToTenant<
    T extends IdentityAuthority.Tenants.Endpoints.AddUserToTeam
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertValidEntityId(params.data.tenant_id);
      assertValidEntityId(params.data.user_id);
    } catch (error) {
      throw new BadRequestException({
        message: "failed to add user to tenant team due to an error",
        data: { error: error },
      });
    }

    await this.addTenantUserCommand.execute({
      tenantId: params.data.tenant_id,
      userId: params.data.user_id,
      requester: params.requester,
    });

    return {};
  }

  @del<IdentityAuthority.Tenants.Endpoints.RemoveUserFromTeam>(
    "/identity-authority/tenants/:tenant_id/team/users/:user_id"
  )
  async removeUserFromTenant<
    T extends IdentityAuthority.Tenants.Endpoints.RemoveUserFromTeam
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertNonEmptyString(params.data.tenant_id);
      assertValidEntityId(params.data.tenant_id);

      assertNonEmptyString(params.data.user_id);
      assertValidEntityId(params.data.user_id);
    } catch (error) {
      throw new BadRequestException({
        message: "failed to remove user from tenant team due to an error",
        data: { error: error },
      });
    }
    await this.removeTenantUserCommand.execute({
      tenantId: params.data.tenant_id,
      userId: params.data.user_id,
      requester: params.requester,
    });
    return {};
  }
}
