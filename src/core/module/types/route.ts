import * as Authorization from "./authorization";
import * as Utils from "./utils";

/**
 * Extract path params from a segment
 * For example `/orders/:orderId/transactions` will extract `orderId`
 */
type ExtractParam<Path, NextPart> = Path extends `:${infer Param}`
  ? Record<Param, string> & NextPart
  : NextPart;

/**
 * Extract value from key-value pair
 * For example `key=:value` will extract `value`
 */
type ExtractKeyValuePair<KeyValuePair, NextPart> =
  KeyValuePair extends `${infer Key}=:${infer Value}`
    ? Record<Value, string | null | undefined> & NextPart
    : NextPart;

/**
 * Explodes query params string
 * For example, `?id=:id&status=:status` will extract `id` and `status`
 */
type ExplodeQueryParams<QueryParams> =
  QueryParams extends `${infer KeyValuePair}&${infer Rest}`
    ? ExtractKeyValuePair<KeyValuePair, ExplodeQueryParams<Rest>>
    : ExtractKeyValuePair<QueryParams, {}>;

/**
 * Converts a path into segments
 * For example `/orders/:orderId/transactions` will extract
 * segments into `orders` , `:orderId`, `transactions`
 */
export type ExtractParams<Path> = (Path extends `${infer Segment}/${infer Rest}`
  ? ExtractParam<Segment, ExtractParams<Rest>>
  : Path extends `:${infer Segment}?${infer Rest}`
  ? Record<Segment, string>
  : ExtractParam<Path, {}>) &
  (Path extends `${infer RightSide}?${infer QueryParams}`
    ? ExplodeQueryParams<QueryParams>
    : {});
type HttpRequestType = Request;
type HttpResponseType = Response;

export type HttpMethod =
  | "GET"
  | "POST"
  | "PATCH"
  | "PUT"
  | "DELETE"
  | "OPTIONS";
export type HttpRequest = HttpRequestType & {
  /** Named route path parameters. For example, if you have the route /user/:name, then the “name” property is available as req.params.name. */
  params: { [key: string]: any };
  /** This property is an object containing a property for each query string parameter in the route.  */
  query: { [key: string]: any };
  /** Contains key-value pairs of data submitted in the request body. */
  body: { [key: string]: any };
  /** Contains key-valur pairs of file data */
  files: { [key: string]: any };
  /** The requester of the request, defined by the token passed to the X-Krypton-Token in the header */
  requester: Authorization.Requester;
  headers: { [key: string]: any };
  userAgent: string;
  clientIp: string;
};
export type HttpResponse = HttpResponseType & {
  /** Sets the HTTP status for the response.  */
  status(code: number): void;
  /** Sends a JSON response */
  json(data: { [key: string]: any }): void;
  sendFile(filePath: string): void;
};

export type EndpointSchema = {
  request: {
    method: HttpMethod;
    path: string;
    data?: { [key: string]: any } | undefined;
  };
  response: { [key: string]: any };
};

export type ValidatorDTO<T extends EndpointSchema> = {
  data: ExtractParams<T["request"]["path"]> &
    Utils.ToUnknownKeys<T["request"]["data"]>;
};

export type ControllerDTO<T extends EndpointSchema> = {
  data: ExtractParams<T["request"]["path"]> &
    Utils.ToUnknownKeys<T["request"]["data"]>;
  requester: Authorization.Requester;
};

export type Handler<T extends EndpointSchema> = (
  params: ControllerDTO<T>
) => Promise<T["response"]>;

// type RouteDefinition<T extends HttpMethod> = <
//   R extends EndpointSchema & { request: { method: T } }
// >(
//   uri: R["request"]["path"],
//   ...args: T extends keyof FrameworkInterface
//     ? [(request: any, response: any, next: any) => void, Handler<R>]
//     : [Handler<R>]
// ) => void;

export type RouteDefinition = (
  path: string,
  middleware: (
    request: HttpRequest,
    response: HttpResponse,
    next: () => void
  ) => void,
  handler: (request: HttpRequest, response: HttpResponse) => Promise<any>
) => void;

export type FrameworkInterface = {
  get: RouteDefinition;
  post: RouteDefinition;
  patch: RouteDefinition;
  put: RouteDefinition;
  delete: RouteDefinition;
};

export type ProxyInterface = {
  [M in "get" | "post" | "patch" | "put" | "delete"]: <
    R extends EndpointSchema & { request: { method: HttpMethod } }
  >(
    uri: R["request"]["path"],
    callback: Handler<R>
  ) => void;
};
