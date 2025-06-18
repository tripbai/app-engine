import { inject, injectable } from "inversify";
import { Access-libraryRepository } from "../access-library.repository";

@injectable()
export class Access-libraryUpdateService {

  constructor(
    @inject(Access-libraryRepository) public readonly access-libraryRepository: Access-libraryRepository
  ) {}

}