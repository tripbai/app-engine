import { Core } from "../../core.types"

export class BaseRequester implements Core.Authorization.Requester {
  readonly user: Core.User.Data | null
  readonly permissions: Array<Core.Authorization.ConcreteToken>
  readonly ipAddress: string
  readonly userAgent: string
  constructor({user, permissions, ipAddress, userAgent}:{
    user: Core.User.Data|null
    permissions: Array<Core.Authorization.ConcreteToken>
    ipAddress: string
    userAgent: string
  }) {
    this.user        = user
    this.permissions = permissions
    this.ipAddress   = ipAddress
    this.userAgent   = userAgent
  }
}