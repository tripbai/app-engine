import { inject, injectable } from "inversify";
import { FeaturesList } from "./features.list";

@injectable()
export class FeatureAssertions {

  constructor(
    
  ) {}

  isValidKey(value: unknown): asserts value is keyof FeaturesList {
    if (typeof value !== 'string') {
      throw new Error(
        'feature key must be typeof string'
      )
    }
    const FeatMap = new FeaturesList
    if (!(value in FeatMap)) {
      throw new Error(
        'feature key must be existing'
      )
    }
  }
}