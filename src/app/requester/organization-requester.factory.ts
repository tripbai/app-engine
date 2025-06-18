import { inject, injectable } from "inversify";
import { OrganizationRequester } from "./organization-requester";
import { Core } from "../../core/module/module";
import { OrganizationPermissionService } from "../organizations/services/organization-permission.service";
import { AppAuthService } from "../../core/auth/services/app-auth-service";

@injectable()
export class OrganizationRequesterFactory {

  constructor(
    @inject(OrganizationPermissionService) public readonly organizationPermissionsService: OrganizationPermissionService,
    @inject(AppAuthService) public readonly appAuthService: AppAuthService
  ) {}

  create(
    requester: Core.Authorization.Requester
  ) {
    return new OrganizationRequester(
      requester, 
      this.organizationPermissionsService,
      this.appAuthService
    )
  }

}