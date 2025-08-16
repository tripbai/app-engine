import { inject, injectable } from "inversify";
import { RegisterDefaultFeatureCommand } from "../commands/register-default-feature.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import * as TripBai from "../../module/types";
import * as Core from "../../../core/module/types";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";
import { FeatureAssertions } from "../feature.assertions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class DefaultFeatureRegisterController {
  constructor(
    @inject(RegisterDefaultFeatureCommand)
    private registerDefaultFeatureCommand: RegisterDefaultFeatureCommand,
    @inject(FeatureAssertions)
    private featureAssertions: FeatureAssertions
  ) {}

  @post<TripBai.Features.Endpoints.RegisterDefaultFeature>("/tripbai/features")
  async registerDefaultFeature<
    T extends TripBai.Features.Endpoints.RegisterDefaultFeature
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const commandDTO: Parameters<RegisterDefaultFeatureCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
      this.featureAssertions.isValidKey(params.data.key);
      commandDTO.featureKey = params.data.key;

      assertNonEmptyString(params.data.value);
      commandDTO.featureValue = params.data.value;

      assertNonEmptyString(params.data.package_id);
      assertValidEntityId(params.data.package_id);
      commandDTO.packageId = params.data.package_id;
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    const newFeatureEntityId = await this.registerDefaultFeatureCommand.execute(
      commandDTO
    );
    return {
      entity_id: newFeatureEntityId,
      key: params.data.key,
      value: params.data.value,
    };
  }
}
