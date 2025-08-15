import { inject, injectable } from "inversify";
import { get } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import {
  BadRequestException,
  LogicException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import { TenantRepository } from "../tenant.repository";
import { TenantUsersRegistry } from "../../teams/tenant-users.registry";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { UserAccessRegistry } from "../../teams/user-access.registry";

@injectable()
export class GetTenantController {
  constructor(
    @inject(TenantRepository)
    private tenantRepository: TenantRepository,
    @inject(TenantUsersRegistry)
    private tenantUsersRegistry: TenantUsersRegistry,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UserAccessRegistry)
    private userAccessRegistry: UserAccessRegistry
  ) {}

  @get<IdentityAuthority.Tenants.Endpoints.GetTenant>(
    "/identity-authority/tenants/:tenant_id"
  )
  async getTenantData<T extends IdentityAuthority.Tenants.Endpoints.GetTenant>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T["response"]> {
    try {
      assertNonEmptyString(params.data.tenant_id);
      assertValidEntityId(params.data.tenant_id);
    } catch (error) {
      throw new BadRequestException({
        message: "invalid get tenant params",
        data: { tenant_id: params.data.tenant_id },
      });
    }
    const tenantModel = await this.tenantRepository.getById(
      params.data.tenant_id
    );
    return {
      entity_id: params.data.tenant_id,
      name: tenantModel.name,
      profile_photo: tenantModel.cover_photo,
      cover_photo: tenantModel.cover_photo,
    };
  }

  // @get<IdentityAuthority.Tenants.Endpoints.GetTenantUsers>('/identity-authority/tenants/:tenant_id/users')
  // async getTenantUsers(
  //   params: Core.Route.ControllerDTO<IdentityAuthority.Tenants.Endpoints.GetTenantUsers>
  // ): Promise<IdentityAuthority.Tenants.Endpoints.GetTenantUsers['response']>{

  //   throw new LogicException({
  //     message: 'unsupported at this time',
  //     data: {}
  //   })

  // try {
  //   assertNonEmptyString(params.data.tenant_id)
  //   assertValidEntityId(params.data.tenant_id)
  // } catch (error) {
  //   throw new BadRequestException({
  //     message: 'invalid get tenant users params',
  //     data: { tenant_id: params.data.tenant_id }
  //   })
  // }
  // const iAuthRequester
  //   = this.iAuthRequesterFactory.create(
  //     params.requester
  //   )
  // if (!iAuthRequester.isRegularUser()) {
  //   throw new ResourceAccessForbiddenException({
  //     message: 'public requesters cannot call this method',
  //     data: params.requester
  //   })
  // }
  // if (!this.userAccessRegistry.canUserAccessTenant({
  //   userId: iAuthRequester.get().user.entity_id,
  //   tenantId: params.data.tenant_id
  // })){
  //   throw new ResourceAccessForbiddenException({
  //     message: 'user must be a member of tenant to see its users',
  //     data:  {tenant_id: params.data.tenant_id, user_id: iAuthRequester.get().user.entity_id}
  //   })
  // }

  // }
}
