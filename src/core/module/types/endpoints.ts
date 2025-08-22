export type AuthWithAppAndSecretKey = {
  request: {
    method: "POST";
    path: "/core/authenticate";
    data: { app_key: string; secret_key: string };
  };
  response: {
    token: string;
  };
};

export type GetAppInfo = {
  request: {
    method: "GET";
    path: "/core/application";
  };
  response: {
    name: string;
    environment: string;
    build_time: string;
  };
};
