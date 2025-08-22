import { inject, injectable } from "inversify";
import { OrganizationRequester } from "./organization-requester";
import * as Core from "../../core/module/types";
import { OrganizationPermissionService } from "../organizations/services/organization-permission.service";
import { AppAuthService } from "../../core/auth/services/app-auth-service";

@injectable()
export class OrganizationRequesterFactory {
  constructor(
    @inject(OrganizationPermissionService)
    private organizationPermissionsService: OrganizationPermissionService,
    @inject(AppAuthService) private appAuthService: AppAuthService
  ) {}

  create(requester: Core.Authorization.Requester) {
    return new OrganizationRequester(
      requester,
      this.organizationPermissionsService,
      this.appAuthService
    );
  }
}
