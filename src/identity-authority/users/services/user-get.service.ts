import { inject, injectable } from "inversify";
import { UserRepository } from "../user.repository";

@injectable()
export class UserGetService {

  constructor(
    @inject(UserRepository) public readonly userRepository: UserRepository
  ){}

  

}