import { injectable } from "inversify";
import { get } from "../../router/decorators";
import { Core } from "../../module/module";
import { AppENV } from "../../helpers/env";
import { Application } from "../../application";

@injectable()
export class AppInfoController {

  @get<Core.Endpoints.Info>('/core/application')
  async getAppInfo<T extends Core.Endpoints.Info>(): Promise<T['response']>{
    return {
      name: Application.name(),
      environment: Application.environment(),
      build_time: Application.build()
    }
  }

}