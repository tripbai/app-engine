import { inject, injectable } from "inversify";
import { StoreRepository } from "../store.repository";

@injectable()
export class StoreUpdateService {
  constructor(
    @inject(StoreRepository) private storeRepository: StoreRepository
  ) {}
}
