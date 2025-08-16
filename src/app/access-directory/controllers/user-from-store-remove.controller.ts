import { inject, injectable } from "inversify";
import { RemoveUserFromStoreCommand } from "../commands/remove-user-from-store.command";
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

@injectable()
export class UserFromStoreRemoveController {
  constructor(
    @inject(RemoveUserFromStoreCommand)
    private removeUserFromStoreCommand: RemoveUserFromStoreCommand
  ) {}

  @post<TripBai.AccessDirectory.Endpoints.RemoveUserFromStore>(
    "/tripbai/access-directory/tenants/:tenant_id/remove-from-stores"
  )
  async removeUserFromStore<
    T extends TripBai.AccessDirectory.Endpoints.RemoveUserFromStore
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const commandDTO: Parameters<RemoveUserFromStoreCommand["execute"]>[0] =
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
        controller_name: "UserFromStoreRemoveController",
      },
    });
  }
}
