import { inject, injectable } from "inversify";
import { AddUserToStoreCommand } from "../commands/add-user-to-store.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class UserToStoreAddController {

  constructor(
    @inject(AddUserToStoreCommand) public readonly addUserToStoreCommand: AddUserToStoreCommand
  ) {}

  @post<TripBai.AccessLibrary.Endpoints.AddUserToStore>('/tripbai/access-directory/tenants/:tenant_id/add-to-stores')
  async addUserToStore<T extends TripBai.AccessLibrary.Endpoints.AddUserToStore>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<AddUserToStoreCommand["execute"]>[0] = Object.create(null)
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
        controller_name: 'UserToStoreAddController'
      }
    })
  }

}