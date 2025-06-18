import { inject, injectable } from "inversify";
import { UpdateOrganizationCommand } from "../commands/update-organization.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class OrganizationUpdateController {

  constructor(
    @inject(UpdateOrganizationCommand) public readonly updateOrganizationCommand: UpdateOrganizationCommand
  ) {}

  @patch<TripBai.Organizations.Endpoints.UpdateOrganization>('/tripbai/organizations/:organization_id')
  async updateOrganization<T extends TripBai.Organizations.Endpoints.UpdateOrganization>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<UpdateOrganizationCommand["execute"]>[0] = Object.create(null)
    commandDTO.requester = params.requester
    try {
    
    } catch (error) {
      throw new BadRequestException({
        message: 'request failed due to invalid params',
        data: { error }
      })
    }
    throw new LogicException({
      message: 'This controller is not implemented yet',
      data: {
        controller_name: 'OrganizationUpdateController'
      }
    })
  }

}