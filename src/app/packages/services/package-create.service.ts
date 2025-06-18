import { inject, injectable } from "inversify";
import { PackageRepository } from "../package.repository";

@injectable()
export class PackageCreateService {

  constructor(
    @inject(PackageRepository) public readonly packageRepository: PackageRepository
  ) {}

}