import { inject, injectable } from "inversify";
import { Core } from "../module/module";
import { RequesterIdentityFactory } from "./requester-identity.factory";

@injectable()
export class RequesterIdentityMiddleware {

  constructor(
    @inject(RequesterIdentityFactory) public readonly RequesterIdentityFactory: RequesterIdentityFactory
  ){}

  handle(
    request: Core.Route.Http.Request, 
    response: Core.Route.Http.Response, 
    next: () => void
  ) {

    const token: string | null 
      = request.headers['x-requester-token'] ?? null
  
    try {
      request.requester = this.RequesterIdentityFactory.create({
        token: token,
        ipAddress: request.clientIp,
        userAgent: request.userAgent
      })
      
      next()
      return
      
    } catch (error) {
      response.status(error.code ?? 401) 
      response.json({
        message: error.message ?? 'The token provided is either invalid or expired'
      })
    }
  }

}