import { inject, injectable } from "inversify";
import { UpdateStoreCommand } from "../commands/update-store.command";
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

@injectable()
export class StoreUpdateController {
  constructor(
    @inject(UpdateStoreCommand)
    private updateStoreCommand: UpdateStoreCommand
  ) {}

  @put<TripBai.Stores.Endpoints.UpdateStore>("/tripbai/stores/:store_id")
  async updateStore<T extends TripBai.Stores.Endpoints.UpdateStore>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<UpdateStoreCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    throw new LogicException({
      message: "This controller is not implemented yet",
      data: {
        controller_name: "StoreUpdateController",
      },
    });
  }
}
