import { inject, injectable } from "inversify";
import { UpdateOrganizationCommand } from "../commands/update-organization.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import { TripBai } from "../../module/module.interface";
import * as Core from "../../../core/module/types";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";
import { OrganizationAssertions } from "../organization.assertions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class OrganizationUpdateController {
  constructor(
    @inject(UpdateOrganizationCommand)
    private updateOrganizationCommand: UpdateOrganizationCommand,
    @inject(OrganizationAssertions)
    private organizationAssertions: OrganizationAssertions
  ) {}

  @patch<TripBai.Organizations.Endpoints.UpdateOrganization>(
    "/tripbai/organizations/:organization_id"
  )
  async updateOrganization<
    T extends TripBai.Organizations.Endpoints.UpdateOrganization
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const commandDTO: Parameters<UpdateOrganizationCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
      assertNonEmptyString(params.data.organization_id);
      assertValidEntityId(params.data.organization_id);
      commandDTO.organizationId = params.data.organization_id;
      if (params.data.status) {
        assertNonEmptyString(params.data.status);
        this.organizationAssertions.assertOrganizationStatus(
          params.data.status
        );
        commandDTO.status = params.data.status;
      }
      if (params.data.business_name) {
        assertNonEmptyString(params.data.business_name);
        commandDTO.businessName = params.data.business_name;
      }
      if (params.data.package_id) {
        assertNonEmptyString(params.data.package_id);
        assertValidEntityId(params.data.package_id);
        commandDTO.packageId = params.data.package_id;
      }
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    await this.updateOrganizationCommand.execute(commandDTO);
    return {};
  }
}
