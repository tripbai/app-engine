import { inject, injectable } from "inversify";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { CreateTenantCommand } from "../commands/create-tenant.command";
import { TenantRepository } from "../tenant.repository";
import { UserAccessRegistry } from "../../teams/user-access.registry";
import { assertIsTenantName } from "../tenant.assertions";

/**
 * Controller for creating a new tenant.
 */
@injectable()
export class TenantCreateController {
  constructor(
    @inject(CreateTenantCommand)
    private readonly createTenantCommand: CreateTenantCommand,
    @inject(UserAccessRegistry)
    private readonly userAccessRegistry: UserAccessRegistry
  ) {}

  @post<IdentityAuthority.Tenants.Endpoints.CreateTenant>(
    "/identity-authority/tenants"
  )
  async createTenant<
    T extends IdentityAuthority.Tenants.Endpoints.CreateTenant
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    try {
      assertIsTenantName(params.data.name);
    } catch (error) {
      throw new BadRequestException({
        message: "failed to create tenant due to invalid input",
        data: { error },
      });
    }
    const result = await this.createTenantCommand.execute(
      params.requester,
      params.data.name
    );
    return {
      entity_id: result.entity_id,
      secret_key: result.secret_key,
      name: result.name,
      profile_photo: result.profile_photo,
      cover_photo: result.cover_photo,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }
}
