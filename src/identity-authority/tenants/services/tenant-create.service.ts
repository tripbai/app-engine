import { inject, injectable } from "inversify";
import { TenantModel } from "../tenant.model";
import {
  RecordAlreadyExistsException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { IAuthRequester } from "../../requester/iauth-requester";
import { UserAccessRegistry } from "../../teams/user-access.registry";
import { TenantRepository } from "../tenant.repository";
import { UserModel } from "../../users/user.model";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import { createEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class TenantCreateService {
  constructor(
    @inject(UserAccessRegistry)
    private userAccessRegistry: UserAccessRegistry,
    @inject(TenantRepository) private tenantRepository: TenantRepository
  ) {}

  async createTenantIfNotExist(
    ownerUserModel: UserModel,
    name: string,
    unitOfWork: UnitOfWork
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
    const secretKey = createEntityId();
    const tenantModel = this.tenantRepository.create(
      {
        secret_key: secretKey,
        name: name,
        profile_photo: null,
        cover_photo: null,
      },
      unitOfWork
    );
    return {
      isNew: true,
      tenantModel: tenantModel,
    };
  }
}
