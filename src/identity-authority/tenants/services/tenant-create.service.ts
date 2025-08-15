import { inject, injectable } from "inversify";
import { TenantModel } from "../tenant.model";
import { TimeStamp } from "../../../core/helpers/timestamp";
import { Pseudorandom } from "../../../core/helpers/pseudorandom";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import * as Core from "../../../core/module/types";
import {
  RecordAlreadyExistsException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { IAuthRequester } from "../../requester/iauth-requester";
import { UserAccessRegistry } from "../../teams/user-access.registry";
import { TenantRepository } from "../tenant.repository";
import { UserModel } from "../../users/user.model";

@injectable()
export class TenantCreateService {
  constructor(
    @inject(UserAccessRegistry)
    private userAccessRegistry: UserAccessRegistry
  ) {}

  async createTenantIfNotExist(
    ownerUserModel: UserModel,
    name: string
  ): Promise<
    | {
        isNew: true;
        tenantModel: TenantModel;
      }
    | {
        isNew: false;
      }
  > {
    if (
      ownerUserModel.status !== "active" &&
      ownerUserModel.status !== "unverified"
    ) {
      throw new ResourceAccessForbiddenException({
        message: "unable to create tenant for user due to status",
        data: { user_id: ownerUserModel.entity_id },
      });
    }
    const ownerUserId = ownerUserModel.entity_id;
    const tenantIdOwnedByUser =
      await this.userAccessRegistry.getOwnedTenantIdOfUserId(ownerUserId);
    if (tenantIdOwnedByUser !== null) {
      return {
        isNew: false,
      };
    }
    const tenantModel: Readonly<TenantModel> = {
      entity_id: createEntityId(),
      name: name,
      secret_key: createEntityId(),
      profile_photo: null,
      cover_photo: null,
      created_at: TimeStamp.now(),
      updated_at: TimeStamp.now(),
      archived_at: null,
    };
    return {
      isNew: true,
      tenantModel: tenantModel,
    };
  }
}
