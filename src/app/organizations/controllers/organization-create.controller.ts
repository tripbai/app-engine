import { inject, injectable } from "inversify";
import { CreateOrganizationCommand } from "../commands/create-organization.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { OrganizationValidator } from "../organization.validator";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class OrganizationCreateController {

  constructor(
    @inject(CreateOrganizationCommand) public readonly createOrganizationCommand: CreateOrganizationCommand
  ) {}

  @post<TripBai.Organizations.Endpoints.CreateOrganization>('/tripbai/organizations')
  async createOrganization<T extends TripBai.Organizations.Endpoints.CreateOrganization>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<CreateOrganizationCommand["execute"]>[0] = Object.create(null)
    commandDTO.requester = params.requester
    try {
      IsValid.NonEmptyString(params.data.tenant_access_certification_token)
      commandDTO.accessCertificationToken = params.data.tenant_access_certification_token

      IsValid.NonEmptyString(params.data.business_name)
      OrganizationValidator.business_name(params.data.business_name)
      commandDTO.businessName = params.data.business_name

      IsValid.NonEmptyString(params.data.package_id)
      EntityToolkit.Assert.idIsValid(params.data.package_id)
      commandDTO.packageId = params.data.package_id

    } catch (error) {
      throw new BadRequestException({
        message: 'request failed due to invalid params',
        data: { error }
      })
    }
    const organizationModel = await this.createOrganizationCommand.execute(commandDTO)
    return {
      organization_id: organizationModel.entity_id,
    }
  }

}