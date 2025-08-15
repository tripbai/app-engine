import { inject, injectable } from "inversify";
import { CreateFeatureOverrideCommand } from "../commands/create-feature-override.command";
import {
  del,
  patch,
  post,
  put,
  get,
} from "../../../core/router/route-decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import {
  BadRequestException,
  LogicException,
} from "../../../core/exceptions/exceptions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { FeatureAssertions } from "../feature.assertions";

@injectable()
export class FeatureOverrideCreateController {
  constructor(
    @inject(CreateFeatureOverrideCommand)
    public readonly createFeatureOverrideCommand: CreateFeatureOverrideCommand,
    @inject(FeatureAssertions)
    public readonly featureAssertions: FeatureAssertions
  ) {}

  @post<TripBai.Features.Endpoints.CreateFeatureOverride>(
    "/tripbai/features/overrides"
  )
  async createFeatureOverride<
    T extends TripBai.Features.Endpoints.CreateFeatureOverride
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    const commandDTO: Parameters<CreateFeatureOverrideCommand["execute"]>[0] =
      Object.create(null);
    commandDTO.requester = params.requester;
    try {
      IsValid.NonEmptyString(params.data.organization_id);
      EntityToolkit.Assert.idIsValid(params.data.organization_id);
      commandDTO.organizationId = params.data.organization_id;

      IsValid.NonEmptyString(params.data.key);
      this.featureAssertions.isValidKey(params.data.key);
      commandDTO.featureKey = params.data.key;

      IsValid.NonEmptyString(params.data.value);
      commandDTO.featureValue = params.data.value;

      IsValid.NonEmptyString(params.data.package_id);
      EntityToolkit.Assert.idIsValid(params.data.package_id);
      commandDTO.packageId = params.data.package_id;

      IsValid.NonEmptyString(params.data.override_for_entity_id);
      EntityToolkit.Assert.idIsValid(params.data.override_for_entity_id);
      commandDTO.featurableEntityId = params.data.override_for_entity_id;

      if (params.data.override_for_entity_type === "store") {
        commandDTO.featurableEntityType = "store";
      } else if (params.data.override_for_entity_type === "organization") {
        commandDTO.featurableEntityType = "organization";
      } else {
        throw new Error(
          'Invalid override_for_entity_type provided. Must be either "store" or "organization".'
        );
      }
    } catch (error) {
      throw new BadRequestException({
        message: "request failed due to invalid params",
        data: { error },
      });
    }
    const result = await this.createFeatureOverrideCommand.execute(commandDTO);
    return {};
  }
}
