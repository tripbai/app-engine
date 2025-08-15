import { inject, injectable } from "inversify";
import { GetStoreQuery } from "../queries/get-store.query";
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
export class StoreGetController {
  constructor(@inject(GetStoreQuery) private getStoreQuery: GetStoreQuery) {}

  @get<TripBai.Stores.Endpoints.GetStore>("/tripbai/stores/:store_id")
  async getStore<T extends TripBai.Stores.Endpoints.GetStore>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<GetStoreQuery["execute"]>[0] =
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
        controller_name: "StoreGetController",
      },
    });
  }
}
