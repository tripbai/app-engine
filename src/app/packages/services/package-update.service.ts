import { inject, injectable } from "inversify";
import { PackageRepository } from "../package.repository";
import { PackageModel } from "../package.model";
import { PackageValidator } from "../package.validator";
import { UnitOfWork } from "../../../core/workflow/unit-of-work";
import { LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class PackageUpdateService {

  constructor(
    @inject(PackageRepository) public readonly packageRepository: PackageRepository
  ) {}

  private updateName(
    name: string,
    packageModel: PackageModel
  ){
    if (packageModel.name === name) {
      return; // No change needed
    }
    PackageValidator.name(name)
    packageModel.name = name
  }

  private updateIsActive(
    isActive: boolean,
    packageModel: PackageModel
  ) {
    if (packageModel.is_active === isActive) {
      return; // No change needed
    }
    packageModel.is_active = isActive
  }

  private async updateIsDefault(
    unitOfWork: UnitOfWork,
    isDefault: boolean,
    packageModel: PackageModel
  ) {
    if (packageModel.is_default === isDefault) {
      return; // No change needed
    }
    if (isDefault === false && packageModel.is_default === true) {
      // Cannot set a package as non-default as it is the only default package
      // There should always be at least one default package
      throw new LogicException({
        message: 'Cannot set package as non-default',
        data: { package_id: packageModel.id }
      })
    }
    const currentDefaultPackage = await this.packageRepository.getCurrentDefaultPackage()
    if (currentDefaultPackage.entity_id === packageModel.entity_id) {
      // If the package is already the default package, no need to change
      return
    }
    // If the package is being set as default, we need to swap it with the current default package
    this.swapDefaultPackage(currentDefaultPackage, packageModel)
    unitOfWork.addTransactionStep(
      // Update the current default package to non-default
      await this.packageRepository.update(currentDefaultPackage)
    )
  }

  async updatePackage(
    unitOfWork: UnitOfWork,
    packageModel: PackageModel,
    params: {
      name?: string
      is_active?: boolean
      is_default?: boolean
    }
  ){
    if (params.name) {
      this.updateName(params.name, packageModel)
    }
    if (params.is_active !== undefined) {
      this.updateIsActive(params.is_active, packageModel)
    }
    if (params.is_default !== undefined) {
      await this.updateIsDefault(unitOfWork, params.is_default, packageModel)
    }
    unitOfWork.addTransactionStep(
      await this.packageRepository.update(packageModel)
    )
  }

  private swapDefaultPackage(
    existingDefaultPackage: PackageModel,
    newDefaultPackage: PackageModel
  ){
    existingDefaultPackage.is_default = false
    newDefaultPackage.is_default = true
  }

}