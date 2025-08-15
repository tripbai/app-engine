export type AWSLambdaEvent = {
  version: "2.0";
  routeKey: string;
  queryStringParameters: { [key: string]: any };
  pathParameters: { [key: string]: any };
  requestContext: {
    http: {
      method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    routeKey: string;
  };
  headers: {
    "x-requester-token"?: string;
  };
  body: string;
};
