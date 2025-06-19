import { inject, injectable } from "inversify";
import { OrganizationRepository } from "../organization.repository";
import { OrganizationModel } from "../organization.model";
import { PackageModel } from "../../packages/package.model";
import { BadRequestException, ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { OrganizationValidator } from "../organization.validator";
import { TripBai } from "../../module/module.interface";
import { OrganizationRequester } from "../../requester/organization-requester";

@injectable()
export class OrganizationUpdateService {

  constructor(
    @inject(OrganizationRepository) public readonly organizationRepository: OrganizationRepository
  ) {}

  updatePackage(
    organizationModel: OrganizationModel,
    packageModel: PackageModel
  ){
    if (!packageModel.is_active) {
      throw new BadRequestException({
        message: 'Cannot update organization to an inactive package',
        data: { package_model_id: packageModel.entity_id }
      })
    }
    organizationModel.package_id = packageModel.entity_id
  }

  updateBusinessName(
    organizationModel: OrganizationModel,
    businessName: string
  ) {
    OrganizationValidator.business_name(businessName)
    organizationModel.business_name = businessName;
  }

  updateStatus(
    organizationRequester: OrganizationRequester,
    organizationModel: OrganizationModel,
    newStatus: TripBai.Organizations.Fields.Status
  ) {
    OrganizationValidator.status(newStatus)
    if (!organizationRequester.isWebAdmin()) {
      throw new ResourceAccessForbiddenException({
        message: 'Only web admins can update organization status',
        data: { requester: organizationRequester.requester }
      });
    }
    organizationModel.status = newStatus
  }

  updateOrganization(params: {
    organizationModel: OrganizationModel,
    organizationRequester: OrganizationRequester,
    packageModel?: PackageModel,
    businessName?: string,
    status?: TripBai.Organizations.Fields.Status
  }){
    if (params.organizationModel.status !== 'active') {
      throw new ResourceAccessForbiddenException({
        message: 'Cannot update organization that is not active',
        data: { organization_model_id: params.organizationModel.entity_id, status: params.organizationModel.status }
      })
    }
    if (params.packageModel) {
      this.updatePackage(params.organizationModel, params.packageModel)
    }
    if (params.businessName) {
      this.updateBusinessName(params.organizationModel, params.businessName)
    }
    if (params.status) {
      this.updateStatus(params.organizationRequester, params.organizationModel, params.status)
    }
  }

}