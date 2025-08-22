import { inject, injectable } from "inversify";
import * as Core from "../../core/module/types";
import { OrganizationPermissionService } from "../organizations/services/organization-permission.service";
import { AppAuthService } from "../../core/auth/services/app-auth-service";
import * as IdentityAuthority from "../../identity-authority/module/types";
import { assertValidEntityId } from "../../core/utilities/entityToolkit";

/** A requester with status that is allowed, and an entity_id */
type IAuthValidRequester = Core.Authorization.Requester & {
  user: {
    entity_id: Core.Entity.Id;
    status: IdentityAuthority.Users.Status.Type;
  };
};

export class OrganizationRequester {
  constructor(
    private requester: Core.Authorization.Requester,
    private organizationPermissionsService: OrganizationPermissionService,
    private appAuthService: AppAuthService
  ) {}

  private static assertIAuthValidRequester(
    requester: Core.Authorization.Requester
  ): asserts requester is IAuthValidRequester {
    if (requester.user === undefined || requester.user === null) {
      throw new Error();
    }
    const userid = requester.user.entity_id;
    if (userid === undefined || userid === null) {
      throw new Error();
    }
    if (userid !== "kernel") {
      try {
        assertValidEntityId(userid);
      } catch (error) {
        throw new Error();
      }
    }
    const status = requester.user.status;
    if (status === undefined || status === null) {
      throw new Error();
    }
    if (
      status !== "active" &&
      status !== "archived" &&
      status !== "banned" &&
      status !== "deactivated" &&
      status !== "suspended" &&
      status !== "unverified"
    ) {
      throw new Error();
    }
  }

  hasAllowedAccess(): boolean {
    try {
      OrganizationRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      return false;
    }
    const status = this.requester.user.status;
    if (
      status === "archived" ||
      status === "banned" ||
      status === "deactivated" ||
      status === "suspended"
    ) {
      const filtered:
        | IdentityAuthority.Users.ApplicationAccess.Limited
        | IdentityAuthority.Users.ApplicationAccess.Prohibited = status;
      return false;
    }
    return true;
  }

  isWebAdmin(): boolean {
    try {
      OrganizationRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      return false;
    }
    return this.organizationPermissionsService.isOneOfThePermissionsAdminLike(
      this.requester.permissions
    );
  }

  isOrganizationAdminOf(organizationId: Core.Entity.Id): boolean {
    try {
      OrganizationRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      return false;
    }
    // if the requester is a web admin, they can operate any organization
    if (this.isWebAdmin()) {
      return true;
    }
    return this.organizationPermissionsService.hasPermissionToOperateThisOrganization(
      organizationId,
      this.requester.permissions
    );
  }

  canOperateStore(params: {
    storeId: Core.Entity.Id;
    organizationId: Core.Entity.Id;
  }): boolean {
    try {
      OrganizationRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      return false;
    }
    // if the requester is a web admin, they can operate any store
    if (this.isWebAdmin()) {
      return true;
    }
    return this.organizationPermissionsService.hasPermissionToOperateThisStore({
      storeId: params.storeId,
      organizationId: params.organizationId,
      requesterPermissions: this.requester.permissions,
    });
  }

  getUserId() {
    OrganizationRequester.assertIAuthValidRequester(this.requester);
    return this.requester.user.entity_id;
  }

  getStatus() {
    OrganizationRequester.assertIAuthValidRequester(this.requester);
    return this.requester.user.status;
  }
}
