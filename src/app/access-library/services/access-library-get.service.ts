import { inject, injectable } from "inversify";
import { AccessLibraryRepository } from "../access-library.repository";

@injectable()
export class AccessLibraryGetService {

  constructor(
    @inject(AccessLibraryRepository) public readonly AccessLibraryRepository: AccessLibraryRepository
  ) {}

}