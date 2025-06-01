import { inject, injectable } from "inversify"
import { Core } from "../module/module"
import { PublicRequester } from "./requester-public"
import { RequesterTokenService } from "./requester-token.service"
import { BaseRequester } from "./requester-base"


@injectable()
export class RequesterIdentityFactory {

  constructor(
    @inject(RequesterTokenService) public readonly RequesterTokenService: RequesterTokenService
  ){}

  create({token, ipAddress, userAgent}: {
    token: string | null
    ipAddress: string
    userAgent: string
  }): Core.Authorization.Requester {

    /** No token means the requester is a public entity */
    if (null === token) {
      return new PublicRequester({
        ipAddress: ipAddress,
        userAgent: userAgent
      })
    }

    const parsed = this.RequesterTokenService.parse(token)

    if (!RequesterIdentityFactory.doesTokenHasValidPayload(parsed)){
      return new PublicRequester({
        ipAddress: ipAddress,
        userAgent: userAgent
      })
    }

    if (
      parsed.data.user.id === undefined || 
      parsed.data.user.id === null || 
      parsed.data.user.status === undefined || 
      parsed.data.user.status === null
    ){
      return new PublicRequester({
        ipAddress: ipAddress,
        userAgent: userAgent
      })
    }

    /**
     * User status must be one of the following values, else, your
     * access will be of a public requester
     */
    if (parsed.data.user.status !== 'active'
      && parsed.data.user.status !== 'unverified'
      && parsed.data.user.status !== 'banned'
      && parsed.data.user.status !== 'archived'
      && parsed.data.user.status !== 'suspended'
      && parsed.data.user.status !== 'deactivated'
    ){
      return new PublicRequester({
        ipAddress: ipAddress,
        userAgent: userAgent
      })
    }

    /**
     * Finally, we build the Requester object
     */
    const permissions = parsed.data.permissions ?? []
    return new BaseRequester({
      user: {
        entity_id: parsed.data.user.id,
        status: parsed.data.user.status
      },
      permissions: permissions,
      ipAddress: ipAddress,
      userAgent: userAgent
    })
  }

  private static doesTokenHasValidPayload = (
    parsed: any
  ): parsed is {
    data: {
      user: { id: string; status: string }
      permissions: any[]
    }
  } => {
    return (
      parsed &&
      typeof parsed === 'object' &&
      parsed.data &&
      typeof parsed.data === 'object' &&
      parsed.data.user &&
      typeof parsed.data.user === 'object' &&
      typeof parsed.data.user.id === 'string' &&
      typeof parsed.data.user.status === 'string' &&
      Array.isArray(parsed.data.permissions)
    )
  }
}