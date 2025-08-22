import { inject, injectable } from "inversify";
import { OrganizationRepository } from "../organization.repository";

@injectable()
export class OrganizationGetService {
  constructor(
    @inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository
  ) {}
}
