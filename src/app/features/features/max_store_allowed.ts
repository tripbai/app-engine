import { BadRequestException } from "../../../core/exceptions/exceptions";
import { FeatureModel } from "../feature.model";

export class MaxStoreAllowed extends FeatureModel {
  constructor() {
    super();
    this.category = "MultiStore";
    this.description = "Allows organization to add multiple stores";
    this.org_mutable = false;
  }

  set(value: unknown) {
    if (typeof value !== "string") {
      throw new BadRequestException({
        message: "feature max_store_allowed value be type of string",
        data: { value: value },
      });
    }
    if (!/^[1-9]\d*$/.test(value)) {
      throw new BadRequestException({
        message: "feature max_store_allowed value must be all numeric",
        data: { value: value },
      });
    }
    this.value = value;
  }

  get(): string {
    return this.value;
  }
}
