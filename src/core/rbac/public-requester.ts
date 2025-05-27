import { BaseRequester } from "./base-requester"

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