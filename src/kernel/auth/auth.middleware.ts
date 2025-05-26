/**
 * Middleware to handle authentication using a token provided in the request headers.
 * 
 * This middleware checks for the presence of an `x-requester-token` in the request headers.
 * If the token is valid, it attaches the parsed token data to the `request.requester` property
 * and proceeds to the next middleware or route handler. If the token is invalid,
 * it returns an HTTP response with an appropriate error code and message.
 * 
 * @async
 * @param {Route.Http.Request} request - The HTTP request object, expected to include headers containing the `x-requester-token`.
 * @param {Route.Http.Response} response - The HTTP response object used to send error responses if authentication fails.
 * @param {Function} next - A callback function to proceed to the next middleware or route handler.
 * 
 * @throws {Error} If the token is invalid or expired, the middleware sends a response with:
 *   - `401 Unauthorized` status (or another error-specific code if provided in `error.code`).
 *   - A JSON object with a descriptive `message` field.
 * 
 * @example
 * // In a route handler setup:
 * app.use(AuthMiddleware);
 */

import { Route } from "../interface"
import { RequesterFactory } from "../rbac/factory"

export const AuthMiddleware = async(
  request: Route.Http.Request,
  response: Route.Http.Response,
  next: () => void
)=>{
  const token: string | null 
    = request.headers['x-requester-token'] ?? null
  
  try {
    request.requester = RequesterFactory.create({
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