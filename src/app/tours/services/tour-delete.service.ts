import { inject, injectable } from "inversify";
import { TourRepository } from "../tour.repository";

@injectable()
export class TourDeleteService {

  constructor(
    @inject(TourRepository) public readonly tourRepository: TourRepository
  ) {}

}