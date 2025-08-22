const routes: Array<{
  path: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  Controller: Function;
  handler: string;
}> = [];

/**
 * Registers a route.
 * @param config
 * @returns
 */
export const registerRoute = (
  config: (typeof routes)[0] | null = null
): typeof routes => {
  if (config === null) return routes;
  routes.push(config);
  return routes;
};

export const getRegisteredRoutes = () => {
  return routes;
};
