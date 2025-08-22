import { inject, injectable } from "inversify";
import { PackageRepository } from "../package.repository";

@injectable()
export class PackageDeleteService {
  constructor(
    @inject(PackageRepository) private packageRepository: PackageRepository
  ) {}
}
