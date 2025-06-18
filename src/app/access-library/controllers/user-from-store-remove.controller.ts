import { inject, injectable } from "inversify";
import { RemoveUserFromStoreCommand } from "../commands/remove-user-from-store.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class UserFromStoreRemoveController {

  constructor(
    @inject(RemoveUserFromStoreCommand) public readonly removeUserFromStoreCommand: RemoveUserFromStoreCommand
  ) {}

  @post<TripBai.AccessLibrary.Endpoints.RemoveUserFromStore>('/tripbai/access-library/tenants/:tenant_id/remove-from-stores')
  async removeUserFromStore<T extends TripBai.AccessLibrary.Endpoints.RemoveUserFromStore>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<RemoveUserFromStoreCommand["execute"]>[0] = Object.create(null)
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
        controller_name: 'UserFromStoreRemoveController'
      }
    })
  }

}