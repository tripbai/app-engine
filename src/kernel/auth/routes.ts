export namespace Auth {
  export namespace Endpoints {
    export type GenerateTokenUsingAppAndSecretKey = {
      request: {
        path: "/kernel/application/authenticate";
        method: "POST",
        data: { app_key: string; secret_key: string };
      };
      response: {
        token: string;
      };
    };
  }
}

