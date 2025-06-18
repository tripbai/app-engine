import { inject, injectable } from "inversify";
import { OrganizationRepository } from "../organization.repository";

@injectable()
export class OrganizationDeleteService {

  constructor(
    @inject(OrganizationRepository) public readonly organizationRepository: OrganizationRepository
  ) {}

}