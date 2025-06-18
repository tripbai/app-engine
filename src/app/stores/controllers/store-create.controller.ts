import { inject, injectable } from "inversify";
import { CreateStoreCommand } from "../commands/create-store.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class StoreCreateController {

  constructor(
    @inject(CreateStoreCommand) public readonly createStoreCommand: CreateStoreCommand
  ) {}

  @post<TripBai.Stores.Endpoints.CreateStore>('/tripbai/stores')
  async createStore<T extends TripBai.Stores.Endpoints.CreateStore>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<CreateStoreCommand["execute"]>[0] = Object.create(null)
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
        controller_name: 'StoreCreateController'
      }
    })
  }

}