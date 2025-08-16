import { AppAuthService } from "../../core/auth/services/app-auth-service";
import * as Core from "../../core/module/types";
import { assertValidEntityId } from "../../core/utilities/entityToolkit";
import * as IdentityAuthority from "../module/types";
import { UserPermissionService } from "../users/services/user-permission.service";
import { IAuthForbiddenAccessException } from "./iauth-requester.exceptions";

/** A requester with status that is allowed, and an entity_id */
type IAuthValidRequester = Core.Authorization.Requester & {
  user: {
    entity_id: Core.Entity.Id;
    status: IdentityAuthority.Users.Status.Type;
  };
};

export class IAuthRequester {
  constructor(
    private requester: Core.Authorization.Requester,
    private userPermissionService: UserPermissionService,
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
      IAuthRequester.assertIAuthValidRequester(this.requester);
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

  isRegularUser(): boolean {
    try {
      IAuthRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      return false;
    }
    return this.userPermissionService.isOneOfThePermissionsBasicUserLike(
      this.requester.permissions,
      this.requester.user.entity_id
    );
  }

  isWebAdmin(): boolean {
    try {
      IAuthRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      return false;
    }
    return this.userPermissionService.isOneOfThePermissionsAdminLike(
      this.requester.permissions
    );
  }

  hasCoreAppAccess() {
    try {
      this.appAuthService.hasHighestPermission(this.requester);
      return true;
    } catch (error) {
      return false;
    }
  }

  canOperateThisUser(userId: Core.Entity.Id): boolean {
    try {
      IAuthRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      return false;
    }
    return this.userPermissionService.caOneOfThePermissionsOperateUser(
      this.requester.permissions,
      userId
    );
  }

  isAModerator(): boolean {
    try {
      IAuthRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      return false;
    }
    if (this.isWebAdmin()) return true;
    return this.userPermissionService.hasModeratorPermission(
      this.requester.permissions
    );
  }

  get(): IAuthValidRequester {
    try {
      IAuthRequester.assertIAuthValidRequester(this.requester);
    } catch (error) {
      throw new IAuthForbiddenAccessException(this.requester);
    }
    return this.requester;
  }
}
