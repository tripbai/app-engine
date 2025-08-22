import { inject, injectable } from "inversify";
import { CreateStoreCommand } from "../commands/create-store.command";
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
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import { assertIsStoreName } from "../store.assertions";

@injectable()
export class StoreCreateController {
  constructor(
    @inject(CreateStoreCommand)
    private createStoreCommand: CreateStoreCommand
  ) {}

  @post<TripBai.Stores.Endpoints.CreateStore>("/tripbai/stores")
  async createStore<T extends TripBai.Stores.Endpoints.CreateStore>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    const commandDTO: Parameters<CreateStoreCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
      assertNonEmptyString(params.data.organization_id);
      assertValidEntityId(params.data.organization_id);
      commandDTO.organizationId = params.data.organization_id;

      assertNonEmptyString(params.data.name);
      assertIsStoreName(params.data.name);
      commandDTO.name = params.data.name;
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    const storeModel = await this.createStoreCommand.execute(commandDTO);
    return {
      entity_id: storeModel.entity_id,
      organization_id: storeModel.organization_id,
      name: storeModel.name,
      about: storeModel.about,
      location_id: storeModel.location_id,
      profile_photo_src: storeModel.profile_photo_src,
      cover_photo_src: storeModel.cover_photo_src,
      status: storeModel.status,
    };
  }
}
