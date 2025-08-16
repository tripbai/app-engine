import { inject, injectable } from "inversify";
import { CreateOrganizationCommand } from "../commands/create-organization.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import * as TripBai from "../../module/types";
import * as Core from "../../../core/module/types";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";
import { assertNonEmptyString } from "../../../core/utilities/assertValid";
import { assertIsOrganizationBusinessName } from "../organization.assertions";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class OrganizationCreateController {
  constructor(
    @inject(CreateOrganizationCommand)
    private createOrganizationCommand: CreateOrganizationCommand
  ) {}

  @post<TripBai.Organizations.Endpoints.CreateOrganization>(
    "/tripbai/organizations"
  )
  async createOrganization<
    T extends TripBai.Organizations.Endpoints.CreateOrganization
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const commandDTO: Parameters<CreateOrganizationCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
      assertNonEmptyString(params.data.tenant_access_certification_token);
      commandDTO.accessCertificationToken =
        params.data.tenant_access_certification_token;

      assertNonEmptyString(params.data.business_name);
      assertIsOrganizationBusinessName(params.data.business_name);
      commandDTO.businessName = params.data.business_name;

      assertNonEmptyString(params.data.package_id);
      assertValidEntityId(params.data.package_id);
      commandDTO.packageId = params.data.package_id;
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    const organizationModel = await this.createOrganizationCommand.execute(
      commandDTO
    );
    return {
      organization_id: organizationModel.entity_id,
    };
  }
}
