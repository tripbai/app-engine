import { Application } from "../../application";
import { RecordNotFoundException } from "../../exceptions/exceptions";
import { Core } from "../../module/module";
import { RequesterIdentityFactory } from "../../requester/requester-identity.factory";
import { LambdaAdapter } from "./lambda-adapter";
import { LambdaRoutesRegistry } from "./lambda-routes-registry";
import { AWSLambdaEvent } from "./lambda.types";

export const router = async (event: AWSLambdaEvent) => {

  let Requester: Core.Authorization.Requester | null = null
  const token = event.headers['x-requester-token'] ?? null

  const requesterIdentityFactory = Application.container().get(RequesterIdentityFactory)

  Requester = requesterIdentityFactory.create({
    token: token,
    ipAddress: event.requestContext.http.sourceIp,
    userAgent: event.requestContext.http.userAgent
  })

  let routeData: Core.Route.ControllerDTO<any> = {
    data: LambdaAdapter.eventToFlowData(event),
    requester: Requester
  }

  const resourcePath = event.requestContext.routeKey

  const callback = LambdaRoutesRegistry.lookup(resourcePath)
  if (callback === null) {
    throw new RecordNotFoundException({
      message: 'callback was not matched to any route handler',
      data: {}
    })
  }

  const response = await callback(routeData)

  return {
    code: 200,
    data: response
  }
}