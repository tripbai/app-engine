import { inject, injectable } from "inversify";
import { PackageRepository } from "../package.repository";

@injectable()
export class PackageGetService {

  constructor(
    @inject(PackageRepository) public readonly packageRepository: PackageRepository
  ) {}

}