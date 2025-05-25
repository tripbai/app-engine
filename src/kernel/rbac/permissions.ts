import { ConcretePermissionToken, AbstractPermissionToken, Entity } from "../interface"
import { PermissionTokenAsserter } from "./assertions"

export const PermissionManager = {
  /**
   * Evaluate permissions based on the level of access separated 
   * by a colon
   * @param existingPermissions the list of existing/given permissions to put on a test
   * @param requiredPermission the required permission for this method to return true
   * @returns true | false
   */
  validate:(
    existingPermissions:Array<ConcretePermissionToken>,
    requiredPermission:ConcretePermissionToken
  )=>{

    for (let i = 0; i < existingPermissions.length; i++) {
      let existingPermission = existingPermissions[i]
  
      /**
       * We evaluate whether the permission required is exactly the same 
       * with the permission the requester would have
       */
      if (existingPermission === requiredPermission) {
        return true
      }
  
      let existingTokens = existingPermission.split(':')
      let proposedTokens = requiredPermission.split(':')
  
      /**
       * Checking whether the existing permissions 
       * has more tokens than the proposed permission.
       * 
       * If that is the case, we return this as FALSE, 
       * because it only means that the given existing permission 
       * is specific only to a certain degree. 
       */
      if (existingTokens.length > proposedTokens.length) continue 

      /**
       * Required/proposed permission can contain a wildcard
       * value (*). In such cases, we will temporarily
       * substitute the wildcard value with the corresponding 
       * existing permission value. 
       */
      for (let k = 0; k < proposedTokens.length; k++) {
        if (proposedTokens[k] === '*') 
          proposedTokens[k] = existingTokens[k] ?? '*'
      }
  
      /**
       * If the number of requester permission tokens 
       * is lesser than the total required permission 
       * tokens
       */
      let hits = 0 
      for (let j = 0; j < existingTokens.length; j++) {
        let existingToken = existingTokens[j];
  
        /**
         * For wildcard tokens, the requester was given the previledge
         * to access any resource depending on where the wildcard appears
         * on the permissions
         */
        if (existingToken==='*') {
          hits++
          continue
        }
  
        if (existingToken === proposedTokens[hits]) {
          hits++
        }
      }
  
      if (hits===existingTokens.length) {
        return true
      }
  
    }
  
    return false
  },

  /**
   * Populates placeholders in an abstract permission tokens
   * @param permission - the Abstract permission token 
   * @param data - populates placeholder in Abstract permission token
   */
  populate(
    permission:AbstractPermissionToken,
    data: {[key:string]:any}
  ): ConcretePermissionToken {
    let tokens = permission.split(':')
    let results:Array<string> = []
    tokens.forEach((token:Entity.Id)=>{
      if (token.charAt(0)==='{') {
        let field = token.replace('{', '')
        field = field.replace('}', '')
        const value = data[field]
        if (value === undefined || value === null) {
          throw new Error(`failed to populate token ${permission} `
          + `due to undefined or null value of field ${field}`)
        }
        results.push(value)
        return
      }
      results.push(token)
    })
    const token = results.join(':')
    PermissionTokenAsserter.isConcrete(token)
    return token
  }

}

