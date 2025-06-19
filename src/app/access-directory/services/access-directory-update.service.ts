import { inject, injectable } from "inversify";
import { AccessDirectoryRepository } from "../access-directory.repository";

@injectable()
export class AccessDirectoryUpdateService {

  constructor(
    @inject(AccessDirectoryRepository) public readonly accessDirectoryRepository: AccessDirectoryRepository
  ) {}

}