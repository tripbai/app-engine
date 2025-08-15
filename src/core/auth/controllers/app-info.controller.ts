import { injectable } from "inversify";
import { get } from "../../router/route-decorators";
import * as Core from "../../module/types";
import { getEnvironmentContext } from "../../application/environmentContext";

@injectable()
export class AppInfoController {
  @get<Core.Endpoints.GetAppInfo>("/core/application")
  async getAppInfo<T extends Core.Endpoints.GetAppInfo>(): Promise<
    T["response"]
  > {
    return {
      name: "unknown",
      environment: getEnvironmentContext(),
      build_time: "unknown",
    };
  }
}
