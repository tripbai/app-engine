import { ResourceAccessForbiddenException } from "../exceptions/exceptions"
import { Requester } from "../interface"
import { PermissionTokenAsserter } from "../rbac/assertions"
import { PermissionManager } from "../rbac/permissions"

export namespace AppPermissionsValidator {
  /**
   * This function checks/validates whether the requester has what we call 
   * "the highest app permissions". This permission scope allows a requester 
   * to do internal actions such as clearing Redis cache, etc.
   */
  export const isHighest = (
    requester: Requester
  ): boolean => {
    const requiredPermission = 'kernel:*'
    PermissionTokenAsserter.isConcrete(requiredPermission)
    if (!PermissionManager.satisfies(requester.permissions,requiredPermission)) {
      throw new ResourceAccessForbiddenException({
        message: 'insufficient kernel-level permission',
        data: {}
      })
    }
    return true
  }
}