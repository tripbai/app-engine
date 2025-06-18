import { inject, injectable } from "inversify";
import { FeatureRepository } from "../feature.repository";

@injectable()
export class FeatureDeleteService {

  constructor(
    @inject(FeatureRepository) public readonly featureRepository: FeatureRepository
  ) {}

}