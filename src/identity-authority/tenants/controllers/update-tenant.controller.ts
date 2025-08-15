import { inject, injectable } from "inversify";
import { UpdateTenantCommand } from "../commands/update-tenant.command";
import { patch } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { BadRequestException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { TenantValidator } from "../tenant.validator";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class UpdateTenantController {
  constructor(
    @inject(UpdateTenantCommand)
    private readonly updateTenantCommand: UpdateTenantCommand
  ) {}

  @patch<IdentityAuthority.Tenants.Endpoints.UpdateTenant>(
    "/identity-authority/tenants/:tenant_id"
  )
  async updateTenant<
    T extends IdentityAuthority.Tenants.Endpoints.UpdateTenant
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const updateParams: {
      name?: string;
      profile_photo?: {
        upload_token: string;
      };
      cover_photo?: {
        upload_token: string;
      };
    } = {};

    try {
      assertValidEntityId(params.data.tenant_id);

      assertNonEmptyString(params.data.name);
      TenantValidator.name(params.data.name);
      updateParams.name = params.data.name;

      if (
        params.data.profile_photo &&
        params.data.profile_photo !== null &&
        typeof params.data.profile_photo === "object" &&
        "upload_token" in params.data.profile_photo &&
        params.data.profile_photo.upload_token
      ) {
        assertNonEmptyString(params.data.profile_photo.upload_token);
        updateParams.profile_photo = {
          upload_token: params.data.profile_photo.upload_token,
        };
      }

      if (
        params.data.cover_photo &&
        params.data.cover_photo !== null &&
        typeof params.data.cover_photo === "object" &&
        "upload_token" in params.data.cover_photo &&
        params.data.cover_photo.upload_token
      ) {
        assertNonEmptyString(params.data.cover_photo.upload_token);
        updateParams.cover_photo = {
          upload_token: params.data.cover_photo.upload_token,
        };
      }
    } catch (error) {
      throw new BadRequestException({
        message: "invalid update tenant params",
        data: { tenant_id: params.data.tenant_id },
      });
    }

    await this.updateTenantCommand.execute(
      params.data.tenant_id,
      params.requester,
      updateParams
    );

    return {};
  }
}
