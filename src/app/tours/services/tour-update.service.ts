import { inject, injectable } from "inversify";
import { TourRepository } from "../tour.repository";

@injectable()
export class TourUpdateService {
  constructor(@inject(TourRepository) private tourRepository: TourRepository) {}
}
