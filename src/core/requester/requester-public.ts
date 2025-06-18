import { BaseRequester } from "./requester-base"

/**
 * A Public Requester is a Requester that is not associated with any
 * user within a given application, but it must be associated to a Tenant.
 * This is useful for public APIs that do not require authentication.
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