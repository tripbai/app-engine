import { inject, injectable } from "inversify";
import { OrganizationRepository } from "../organization.repository";
import { OrganizationIAuthTokenService } from "./organization-iauth-token.service";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { OrganizationModel } from "../organization.model";
import { PackageModel } from "../../packages/package.model";
import * as Core from "../../../core/module/types";
import { OrganizationRequester } from "../../requester/organization-requester";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import { createEntityId } from "../../../core/utilities/entityToolkit";

@injectable()
export class OrganizationCreateService {
  constructor(
    @inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository,
    @inject(OrganizationIAuthTokenService)
    private organizationIAuthTokenService: OrganizationIAuthTokenService
  ) {}

  async createOrganizationIfNotExist(params: {
    unitOfWork: UnitOfWork;
    requester: OrganizationRequester;
    businessName: string;
    accessCertificationToken: string;
    packageModel: PackageModel;
  }) {
    const tokenData = await this.organizationIAuthTokenService.parseToken(
      params.accessCertificationToken
    );
    if (!tokenData.is_owner) {
      throw new ResourceAccessForbiddenException({
        message: "Only tenant owners can create organizations",
        data: { token_data: tokenData },
      });
    }
    if (params.requester.getUserId() !== tokenData.user_id) {
      throw new ResourceAccessForbiddenException({
        message: "Tenant owner entity ID does not match token data user ID",
        data: {
          tenant_owner_entity_id: params.requester.getUserId(),
          token_data_user_id: tokenData.user_id,
        },
      });
    }
    if (!params.packageModel.is_active) {
      throw new ResourceAccessForbiddenException({
        message: "Package is not active, cannot create organization",
        data: { package_model: params.packageModel },
      });
    }
    if (!params.packageModel.is_default) {
      throw new ResourceAccessForbiddenException({
        message: "Package is not default, cannot create organization",
        data: { package_model: params.packageModel },
      });
    }
    const tenantId = tokenData.tenant_id;
    try {
      const organizationModel =
        await this.organizationRepository.getByIdWithArchived(tenantId);
      if (organizationModel.archived_at !== null) {
        // Users will need to reach out to support to unarchive the organization
        throw new Error("Organization is archived, cannot create a new one");
      }
      // organization already exists, no need to create a new one
      return organizationModel;
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error("Unknown error occurred");
      }
      if (
        error.message === "Organization is archived, cannot create a new one"
      ) {
        throw new ResourceAccessForbiddenException({
          message: error.message,
          data: { tenant_id: tenantId },
        });
      }
      // organizationRepository.getById threw an error, which means the organization does not exist
      // we can proceed to create a new organization
    }
    const secretKey = createEntityId();
    const organizationModel = this.organizationRepository.create(
      {
        secret_key: secretKey,
        business_name: params.businessName,
        package_id: params.packageModel.entity_id,
        status: "active",
      },
      params.unitOfWork
    );
    return organizationModel;
  }
}
