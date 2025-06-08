import { inject, injectable } from "inversify";
import { UserPermissionService } from "../users/services/user-permission.service";
import { Core } from "../../core/module/module";
import { UnauthorizedAccessException, ResourceAccessForbiddenException } from "../../core/exceptions/exceptions";
import { EntityToolkit } from "../../core/orm/entity/entity-toolkit";
import { IdentityAuthority } from "../module/module.interface";

/** A requester with status that is allowed, and an entity_id */
export type RequesterWithAllowedAccess = Core.Authorization.Requester & {user: {entity_id: Core.Entity.Id, status: IdentityAuthority.Users.ApplicationAccess.Allowed}}
export type RequesterWithBasicAccess = RequesterWithAllowedAccess & { access: 'basic' }

@injectable()
export class IAuthPermissionsService {

  constructor(
    @inject(UserPermissionService) public readonly userPermissionService: UserPermissionService
  ){}

  isRequesterHasAllowedStatus (requester: Core.Authorization.Requester): asserts requester is RequesterWithAllowedAccess {
    try {
      if (requester.user===undefined||requester.user===null) {
        throw new Error()
      }
      const status = requester.user.status
      if (status===undefined||status===null) {
        throw new Error()
      }
      if (status==='archived'||status==='banned'||status==='deactivated'||status==='suspended') {
        const filtered: IdentityAuthority.Users.ApplicationAccess.Limited | IdentityAuthority.Users.ApplicationAccess.Prohibited = status 
        throw new Error()
      }
      const userid = requester.user.entity_id
      if (userid === undefined || userid === null) {
        throw new Error()
      }
      if (userid !== 'kernel') {
        EntityToolkit.Assert.idIsValid(userid)
      }
    } catch (error) {
      throw new UnauthorizedAccessException({
        message: 'requester has no allowed status',
        data: {requester: requester}
      })
    }
  }

  isRequesterHasBasicUserPermission (requester: Core.Authorization.Requester): asserts requester is Core.Authorization.Requester & {user: {entity_id: Core.Entity.Id, status: IdentityAuthority.Users.ApplicationAccess.Allowed}} {
    try {
      this.isRequesterHasAllowedStatus(requester)
      if (!this.userPermissionService.isOneOfThePermissionsBasicUserLike(
        requester.permissions,
        requester.user.entity_id
      )) {
        throw new Error()
      }
    } catch (error) {
      throw new ResourceAccessForbiddenException({
        message: 'requester has no basic access permission',
        data: {requester: requester}
      })
    }
  }

  isRequesterALimitedAccessUser (requester: Core.Authorization.Requester): asserts requester is Core.Authorization.Requester & {user: {entity_id: Core.Entity.Id, status: IdentityAuthority.Users.ApplicationAccess.Limited}} { 
    try {
      if (requester.user === undefined || requester.user === null) {
        throw new Error()
      }
      const status = requester.user.status
      if (status === undefined || status === null) {
        throw new Error()
      }
      if (status !== 'deactivated' && status !== 'archived') {
        throw new Error()
      }
      EntityToolkit.Assert.idIsValid(requester.user.entity_id)
      if (!this.userPermissionService.isOneOfThePermissionsBasicUserLike(
        requester.permissions,
        requester.user.entity_id
      )) {
        throw new Error()
      }
    } catch (error) {
      throw new UnauthorizedAccessException({
        message: 'requester has no limited permission',
        data: {requester: requester}
      })
    }
  }

  isRequesterAWebAdmin (requester: Core.Authorization.Requester): asserts requester is Core.Authorization.Requester & {user: {entity_id: Core.Entity.Id, status: IdentityAuthority.Users.ApplicationAccess.Allowed}} {
    try {
      this.isRequesterHasAllowedStatus(requester)
      if (!this.userPermissionService.isOneOfThePermissionsAdminLike(
        requester.permissions
      )) {
        throw new Error()
      }
    } catch (error) {
      throw new ResourceAccessForbiddenException({
        message: 'requester has no web admin permission',
        data: {requester: requester}
      })
    }
  }

  canRequesterOperateThisUser(
    requester: Core.Authorization.Requester & {user: {entity_id: Core.Entity.Id, status: IdentityAuthority.Users.ApplicationAccess.Allowed}},
    userId: Core.Entity.Id
  ){
    try {
      if (!this.userPermissionService.caOneOfThePermissionsOperateUser(
        requester.permissions,
        userId
      )) {
        throw new Error()
      }
    } catch (error) {
      throw new ResourceAccessForbiddenException({
        message: 'requester has no permission to operate on this user',
        data: {requester: requester}
      })
    }
  }

  

}