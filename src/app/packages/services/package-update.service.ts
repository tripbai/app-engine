import { inject, injectable } from "inversify";
import { PackageRepository } from "../package.repository";

@injectable()
export class PackageUpdateService {

  constructor(
    @inject(PackageRepository) public readonly packageRepository: PackageRepository
  ) {}

}