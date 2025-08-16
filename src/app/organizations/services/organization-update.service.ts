import { inject, injectable } from "inversify";
import { OrganizationRepository } from "../organization.repository";
import { OrganizationModel } from "../organization.model";
import { PackageModel } from "../../packages/package.model";
import {
  BadRequestException,
  ResourceAccessForbiddenException,
} from "../../../core/exceptions/exceptions";
import * as TripBai from "../../module/types";
import { OrganizationRequester } from "../../requester/organization-requester";
import {
  assertIsOrganizationBusinessName,
  assertIsOrganizationStatus,
} from "../organization.assertions";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";

@injectable()
export class OrganizationUpdateService {
  constructor(
    @inject(OrganizationRepository)
    private organizationRepository: OrganizationRepository
  ) {}

  updatePackage(
    organizationModel: OrganizationModel,
    packageModel: PackageModel
  ) {
    if (!packageModel.is_active) {
      throw new BadRequestException({
        message: "Cannot update organization to an inactive package",
        data: { package_model_id: packageModel.entity_id },
      });
    }
    organizationModel.package_id = packageModel.entity_id;
  }

  updateBusinessName(
    organizationModel: OrganizationModel,
    businessName: string
  ) {
    assertIsOrganizationBusinessName(businessName);
    organizationModel.business_name = businessName;
  }

  updateType(
    organizationRequester: OrganizationRequester,
    organizationModel: OrganizationModel,
    newType: TripBai.Organizations.Fields.Type
  ) {
    if (!organizationRequester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "Only web admins can update organization type",
        data: { requester: organizationRequester },
      });
    }
    if (organizationModel.type === newType) {
      return; // do nothing
    }
    if (organizationModel.type === "business" && newType === "personal") {
      throw new ResourceAccessForbiddenException({
        message: "Cannot change organization type from business to personal",
        data: { organization_id: organizationModel.entity_id },
      });
    }
    organizationModel.type = newType;
  }

  updateStatus(
    organizationRequester: OrganizationRequester,
    organizationModel: OrganizationModel,
    newStatus: TripBai.Organizations.Fields.Status
  ) {
    assertIsOrganizationStatus(newStatus);
    if (!organizationRequester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: "Only web admins can update organization status",
        data: { requester: organizationRequester },
      });
    }
    organizationModel.status = newStatus;
  }

  async updateOrganization(params: {
    organizationModel: OrganizationModel;
    organizationRequester: OrganizationRequester;
    unitOfWork: UnitOfWork;
    packageModel?: PackageModel;
    businessName?: string;
    status?: TripBai.Organizations.Fields.Status;
    type?: TripBai.Organizations.Fields.Type;
  }) {
    if (params.organizationModel.status !== "active") {
      throw new ResourceAccessForbiddenException({
        message: "Cannot update organization that is not active",
        data: {
          organization_model_id: params.organizationModel.entity_id,
          status: params.organizationModel.status,
        },
      });
    }
    if (params.packageModel) {
      this.updatePackage(params.organizationModel, params.packageModel);
    }
    if (params.businessName) {
      this.updateBusinessName(params.organizationModel, params.businessName);
    }
    if (params.type) {
      this.updateType(
        params.organizationRequester,
        params.organizationModel,
        params.type
      );
    }
    if (params.status) {
      this.updateStatus(
        params.organizationRequester,
        params.organizationModel,
        params.status
      );
    }
    await this.organizationRepository.update(
      params.organizationModel,
      params.unitOfWork
    );
  }
}
