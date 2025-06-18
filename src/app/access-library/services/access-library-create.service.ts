import { inject, injectable } from "inversify";
import { AccessLibraryRepository } from "../access-library.repository";

@injectable()
export class AccessLibraryCreateService {

  constructor(
    @inject(AccessLibraryRepository) public readonly AccessLibraryRepository: AccessLibraryRepository
  ) {}

}