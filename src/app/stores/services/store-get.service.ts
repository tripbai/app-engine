import { inject, injectable } from "inversify";
import { StoreRepository } from "../store.repository";

@injectable()
export class StoreGetService {

  constructor(
    @inject(StoreRepository) public readonly storeRepository: StoreRepository
  ) {}

}