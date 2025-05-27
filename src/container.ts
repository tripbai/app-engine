import { Container } from "inversify"
import { JsonWebToken } from "./core/providers/jwt/jsonwebtoken/json-web-token.service"
import { PermissionTokenValidator } from "./core/rbac/permission-token.validator"
import { RequesterTokenService } from "./core/rbac/requester-token.service"

export const AppContainer = new Container()
AppContainer.bind(JsonWebToken).toSelf()
AppContainer.bind(PermissionTokenValidator).toSelf()
AppContainer.bind(RequesterTokenService).toSelf()