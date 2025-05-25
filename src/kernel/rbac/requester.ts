import { ConcretePermissionToken, Requester, User } from "../interface";

export class BaseRequester implements Requester {
  readonly user: User.Data | null
  readonly permissions: Array<ConcretePermissionToken>
  readonly ipAddress: string
  readonly userAgent: string
  constructor({user, permissions, ipAddress, userAgent}:{
    user: User.Data|null
    permissions: Array<ConcretePermissionToken>
    ipAddress: string
    userAgent: string
  }) {
    this.user        = user
    this.permissions = permissions
    this.ipAddress   = ipAddress
    this.userAgent   = userAgent
  }
}

/**
 * A Public Requester is a Requester that is not associated with any
 * user within a given application, but it must be associated to a Tenant
 */
export class PublicRequester extends BaseRequester {
  constructor({ipAddress, userAgent}: {
    ipAddress: string
    userAgent: string
  }){
    const user = null
    const permissions = []
    super({user, permissions, ipAddress, userAgent})
  }
}

