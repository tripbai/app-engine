import { inject, injectable } from "inversify";
import { TourRepository } from "../tour.repository";

@injectable()
export class TourGetService {

  constructor(
    @inject(TourRepository) public readonly tourRepository: TourRepository
  ) {}

}