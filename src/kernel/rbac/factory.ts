import { Requester } from "../interface"
import { BaseRequester, PublicRequester } from "./requester"
import { RequesterToken } from "./token"

export namespace RequesterFactory {

  export const create = ({token, ipAddress, userAgent}: {
    token: string | null
    ipAddress: string
    userAgent: string
  }): Requester => {
    /** No token means the requester is a public entity */
    if (null === token) {
      return new PublicRequester({
        ipAddress: ipAddress,
        userAgent: userAgent
      })
    }
    const parsed = RequesterToken.parse(token)
    /**
     * Passing a token without these fields will automatically default your
     * access as a public requester
     */
    if (parsed.data.user === undefined || parsed.data.user === null) {
      return new PublicRequester({
        ipAddress: ipAddress,
        userAgent: userAgent
      })
    }

    const user = parsed.data.user 
    if (
      user.id === undefined || 
      user.id === null || 
      user.status === undefined || 
      user.status === null
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
    if (user.status!=='active'
      && user.status!=='unverified'
      && user.status!=='banned'
      && user.status!=='archived'
      && user.status!=='suspended'
      && user.status!=='deactivated'
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
        entity_id: user.id,
        status: user.status
      },
      permissions: permissions,
      ipAddress: ipAddress,
      userAgent: userAgent
    })

  }

}