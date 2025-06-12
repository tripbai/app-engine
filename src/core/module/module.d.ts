export namespace Core {

  export namespace Entity {
    /**
     * The Entity ID of an object. This value can only be provided once,
     * and cannot be overriden. This property only accepts value typeof string,
     * with characters not lesser than 1 and not more than 32.
     */
    export type Id = string & { length: 32 };
    /**
     * The external id representation of the Entity Object.
     * Please know that this value is not universally unique,
     * and it's only unique within the type of entity
     */
    export type ExternalId = number;
    export type PropAlias = `_${string}`;
    export type ReservedFields = 'id' | 'entity_id' | 'created_at' | 'updated_at';
  }

  export namespace User {
    export type Status =
      | "active"
      | "unverified"
      | "banned"
      | "archived"
      | "suspended"
      | "deactivated";
    export type Data = { entity_id: string; status: User.Status };
  }

  export namespace Authorization {

    /**
     * A permission token with placeholders. For example,
     * user:{user_id}.
     * This token needs to be populated with data first
     * before this can be validated
     */
    export type AbstractToken = string & {
      delimiter: ":";
      placeholders: true;
    };

    /**
     * A permission token with actual values. For example,
     * user:sampleuserid
     */
    export type ConcreteToken = string & {
      delimiter: ":";
      placeholders: false;
    };

    /**
     * An actor or a requester to an API call. The Requester
     * object holds different data, such as, the id and status of
     * the User (Requester)
     */
    export type Requester = {
      readonly user: User.Data | null;
      readonly permissions: Array<ConcreteToken>;
      readonly ipAddress: string; 
      readonly userAgent: string
    };

    export type RequesterTokenPayload = {
      user: { id: string; status: string }
      permissions: Array<ConcreteToken>
    }

  }

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

  export type ToUnknownKeys<T> = { [K in keyof T]: unknown };

  type HttpRequestType = Request;
  type HttpResponse = Response;

  /**
  * A collection of types that relates to routes or routing
  */
  export namespace Route {
    export namespace Endpoint {
      export type Schema = {
        request: {
          method: Http.Method;
          path: string;
          data?: { [key: string]: any } | undefined;
        };
        response: { [key: string]: any };
      };
    }

    export type ControllerDTO<T extends Route.Endpoint.Schema> = {
      data: ExtractParams<T["request"]["path"]> &
        ToUnknownKeys<T["request"]["data"]>;
      requester: Authorization.Requester;
    };


    export type Handler<T extends Route.Endpoint.Schema> = (
      params: Route.ControllerDTO<T>
    ) => Promise<T["response"]>;

    export namespace Http {
      export type Method =
        | "GET"
        | "POST"
        | "PATCH"
        | "PUT"
        | "DELETE"
        | "OPTIONS";
      export type ContentType = "image/png";
      export type Request = HttpRequestType & {
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
        userAgent: string;
        clientIp: string;
      };
      export type Response = HttpResponse & {
        /** Sets the HTTP status for the response.  */
        status(code: number);
        /** Sends a JSON response */
        json(data: { [key: string]: any });
        sendFile(filePath: string);
      };
    }

    type RouteDefinition<T extends Http.Method> = <
      R extends Route.Endpoint.Schema & { request: { method: T } }
    >(
      uri: R["request"]["path"],
      ...args: T extends keyof FrameworkInterface
        ? [(request: any, response: any, next: any) => void, Route.Handler<R>]
        : [Route.Handler<R>]
    ) => void;

    export type FrameworkInterface = {
      [M in Http.Method]: RouteDefinition<M>;
    };

    export type ProxyInterface = {
      [M in 'get'|'post'|'patch'|'put'|'delete']: <
        R extends Route.Endpoint.Schema & { request: { method: Http.Method } }
      >(
        uri: R["request"]["path"],
        callback: Route.Handler<R>
      ) => void;
    };
  }

  export namespace File {
    export type UploadPath = string & { format: 'files/{full_year}/{month}/{file_name}.{file_extension}' }
  }

  export namespace Endpoints {
    export namespace Auth {
      export type WithAppAndSecretKey = {
        request: {
          method: 'POST'
          path: '/core/authenticate'
          data: {app_key: string, secret_key: string}
        }
        response: {
          token: string
        }
      }
    }
    export type Info = {
      request: {
        method: 'GET'
        path: '/core/application'
      }
      response: {
        name: string,
        environment: string,
        build_time: string
      }
    }
  }
}