import { inject, injectable } from "inversify";
import { RegisterDefaultFeatureCommand } from "../commands/register-default-feature.command";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";
import { FeatureAssertions } from "../feature.assertions";
import { IsValid } from "../../../core/helpers/isvalid";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";

@injectable()
export class DefaultFeatureRegisterController {

  constructor(
    @inject(RegisterDefaultFeatureCommand) public readonly registerDefaultFeatureCommand: RegisterDefaultFeatureCommand,
    @inject(FeatureAssertions) public readonly featureAssertions: FeatureAssertions
  ) {}

  @post<TripBai.Features.Endpoints.RegisterDefaultFeature>('/tripbai/features')
  async registerDefaultFeature<T extends TripBai.Features.Endpoints.RegisterDefaultFeature>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<RegisterDefaultFeatureCommand["execute"]>[0] = Object.create(null)
    commandDTO.requester = params.requester
    try {
      this.featureAssertions.isValidKey(params.data.key)
      commandDTO.featureKey = params.data.key

      IsValid.NonEmptyString(params.data.value)
      commandDTO.featureValue = params.data.value

      IsValid.NonEmptyString(params.data.package_id)
      EntityToolkit.Assert.idIsValid(params.data.package_id)
      commandDTO.packageId = params.data.package_id

    } catch (error) {
      throw new BadRequestException({
        message: 'request failed due to invalid params',
        data: { error }
      })
    }
    const newFeatureEntityId = await this.registerDefaultFeatureCommand.execute(commandDTO)
    return {
      entity_id: newFeatureEntityId,
      key: params.data.key,
      value: params.data.value
    }
  }

}