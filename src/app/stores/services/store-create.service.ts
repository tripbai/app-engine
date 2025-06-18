import { inject, injectable } from "inversify";
import { StoreRepository } from "../store.repository";

@injectable()
export class StoreCreateService {

  constructor(
    @inject(StoreRepository) public readonly storeRepository: StoreRepository
  ) {}

}