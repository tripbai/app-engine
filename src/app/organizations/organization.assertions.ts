import { inject, injectable } from "inversify";
import { TripBai } from "../module/module.interface";
import { OrganizationValidator } from "./organization.validator";

@injectable()
export class OrganizationAssertions {
  
  constructor(

  ) {}

  assertOrganizationStatus(value: string): asserts value is TripBai.Organizations.Fields.Status {
    OrganizationValidator.status(value)
  }
}