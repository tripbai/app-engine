import { inject, injectable } from "inversify"
import { Core } from "../../module/module"
import { PermissionTokenValidator } from "./permission-token.validator"

@injectable()
export class PermissionManager {

  constructor(
    @inject(PermissionTokenValidator) public readonly PermissionTokenValidator: PermissionTokenValidator
  ){

  }

  /**
   * Evaluate permissions based on the level of access separated 
   * by a colon
   * @param assignedPermissions the list of assigned/granted permissions to a request to put on a test
   * @param requiredPermission the required permission for this method to return true
   * @returns true | false
   */
  satisfies(
    assignedPermissions:Array<Core.Authorization.ConcreteToken>,
    requiredPermission:Core.Authorization.ConcreteToken
  ): boolean {

    for (let i = 0; i < assignedPermissions.length; i++) {
      let assignedPermission = assignedPermissions[i]
  
      /**
       * We evaluate whether the permission required is exactly the same 
       * with the permission the requester would have
       */
      if (assignedPermission === requiredPermission) {
        return true
      }
  
      let assignedPermissionParts = assignedPermission.split(':')
      let requiredPermissionParts = requiredPermission.split(':')
  
      /**
       * Checking whether the existing permissions 
       * has more tokens than the proposed permission.
       * 
       * If that is the case, we return this as FALSE, 
       * because it only means that the given existing permission 
       * is specific only to a certain degree. 
       */
      if (assignedPermissionParts.length > requiredPermissionParts.length) continue 

      /**
       * Required/proposed permission can contain a wildcard
       * value (*). In such cases, we will temporarily
       * substitute the wildcard value with the corresponding 
       * existing permission value. 
       */
      for (let k = 0; k < requiredPermissionParts.length; k++) {
        if (requiredPermissionParts[k] === '*') 
        requiredPermissionParts[k] = assignedPermissionParts[k] ?? '*'
      }
  
      /**
       * If the number of requester permission tokens 
       * is lesser than the total required permission 
       * tokens
       */
      let hits = 0 
      for (let j = 0; j < assignedPermissionParts.length; j++) {
        let assignedPermissionPart = assignedPermissionParts[j];
  
        /**
         * For wildcard tokens, the requester was given the previledge
         * to access any resource depending on where the wildcard appears
         * on the permissions
         */
        if (assignedPermissionPart === '*') {
          hits++
          continue
        }
  
        if (assignedPermissionPart === requiredPermissionParts[hits]) {
          hits++
        }
      }
  
      if (hits === assignedPermissionParts.length) {
        return true
      }
  
    }
  
    return false
  }

  /**
   * Populates placeholders in an abstract permission tokens
   * @param permission - the Abstract permission token 
   * @param data - populates placeholder in Abstract permission token
   */
  populate(
    permission: Core.Authorization.AbstractToken,
    data: { [key: string]: any }
  ): Core.Authorization.ConcreteToken {
    const tokens = permission.split(':')
    const results: Array<string> = []
  
    tokens.forEach((token: Core.Entity.Id) => {
      if (token.startsWith('{') && token.endsWith('}')) {
        const field = token.slice(1, -1) // remove the braces
        const value = data[field]
  
        if (value === undefined || value === null) {
          throw new Error(`failed to populate token ${permission} `
            + `due to undefined or null value of field ${field}`)
        }
  
        results.push(value)
      } else {
        results.push(token)
      }
    })
  
    const token = results.join(':')
    this.PermissionTokenValidator.isConcrete(token)
    return token
  }
}
