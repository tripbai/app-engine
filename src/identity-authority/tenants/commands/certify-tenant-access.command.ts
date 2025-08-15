import { inject, injectable } from "inversify";
import { TenantAccessCertificationService } from "../services/tenant-access-certification.service";
import * as Core from "../../../core/module/types";
import { IAuthRequesterFactory } from "../../requester/iauth-requester.factory";
import { ResourceAccessForbiddenException } from "../../../core/exceptions/exceptions";
import { UserRepository } from "../../users/user.repository";
import { TenantRepository } from "../tenant.repository";

@injectable()
export class CertifyTenantAccessCommand {
  constructor(
    @inject(TenantAccessCertificationService)
    private tenantAccessCertificationService: TenantAccessCertificationService,
    @inject(IAuthRequesterFactory)
    private iAuthRequesterFactory: IAuthRequesterFactory,
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(TenantRepository) private tenantRepository: TenantRepository
  ) {}

  async execute(
    requester: Core.Authorization.Requester,
    tenantId: Core.Entity.Id
  ) {
    const iAuthRequester = this.iAuthRequesterFactory.create(requester);
    if (!iAuthRequester.isRegularUser()) {
      throw new ResourceAccessForbiddenException({
        message: "public users cannot create tenant",
        data: requester,
      });
    }
    const userId = iAuthRequester.get().user.entity_id;
    const userModel = await this.userRepository.getById(userId);
    const tenantModel = await this.tenantRepository.getById(tenantId);
    const token = await this.tenantAccessCertificationService.generateToken(
      userModel,
      tenantModel
    );
    return token;
  }
}
