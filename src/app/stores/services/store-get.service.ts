import { inject, injectable } from "inversify";
import { StoreRepository } from "../store.repository";

@injectable()
export class StoreGetService {
  constructor(
    @inject(StoreRepository) private storeRepository: StoreRepository
  ) {}
}
