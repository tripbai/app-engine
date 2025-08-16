import { expect } from "chai";
import { createMock } from "../../../../core/utilities/mockup";
import { PackageRepository } from "../../package.repository";
import { PackageUpdateService } from "../package-update.service";
import { PackageModel } from "../../package.model";
import { UnitOfWork } from "../../../../core/workflow/unit-of-work";
import { createEntityId } from "../../../../core/utilities/entityToolkit";

describe("PackageUpdateService", () => {
  it("should update package name correctly", async () => {
    let packageName = "Before Package Name";
    const packageRepository = createMock(PackageRepository, {
      update: async (packageModel, unitOfWork) => {
        packageName = packageModel.name;
      },
    });
    const packageUpdateService = new PackageUpdateService(packageRepository);
    const unitOfWork = createMock(UnitOfWork);
    const packageModel = new PackageModel();
    packageModel.name = packageName;
    packageModel.is_active = true;
    packageModel.is_default = false;
    await packageUpdateService.updatePackage(unitOfWork, packageModel, {
      name: "After Package Name",
    });
    expect(packageName).to.equal("After Package Name");
  });
  it("should throw error if trying to set package as non-default when it is the only default package", async () => {
    const packageRepository = createMock(PackageRepository);
    const packageUpdateService = new PackageUpdateService(packageRepository);
    const unitOfWork = createMock(UnitOfWork);
    const packageModel = new PackageModel();
    packageModel.name = "Existing Package";
    packageModel.is_active = true;
    packageModel.is_default = true;
    try {
      await packageUpdateService.updatePackage(unitOfWork, packageModel, {
        is_default: false,
      });
      expect.fail("Expected error not thrown");
    } catch (error) {
      if (!(error instanceof Error)) {
        expect.fail("Expected error not thrown");
      }
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.include("Cannot set package as non-default");
    }
  });
  it("should swap default package when updating", async () => {
    const packageStorage: Map<string, PackageModel> = new Map();
    const currentDefaultPackageId = createEntityId();
    const currentDefaultPackage = new PackageModel();
    currentDefaultPackage.entity_id = currentDefaultPackageId;
    currentDefaultPackage.name = "Current Default Package";
    currentDefaultPackage.is_active = true;
    currentDefaultPackage.is_default = true;
    packageStorage.set(currentDefaultPackageId, currentDefaultPackage);
    const newDefaultPackageId = createEntityId();
    const newDefaultPackage = new PackageModel();
    newDefaultPackage.entity_id = newDefaultPackageId;
    newDefaultPackage.name = "New Default Package";
    newDefaultPackage.is_active = true;
    newDefaultPackage.is_default = false;
    packageStorage.set(newDefaultPackageId, newDefaultPackage);
    const packageRepository = createMock(PackageRepository, {
      hasDefaultPackage: async () => true,
      getCurrentDefaultPackage: async () => {
        return packageStorage.get(currentDefaultPackageId)!;
      },
      update: async (packageModel, unitOfWork) => {
        const packageId = packageModel.entity_id;
        packageStorage.set(packageId, packageModel);
      },
    });
    const packageUpdateService = new PackageUpdateService(packageRepository);
    const unitOfWork = createMock(UnitOfWork);
    await packageUpdateService.updatePackage(unitOfWork, newDefaultPackage, {
      is_default: true,
    });
    expect(packageStorage.get(currentDefaultPackageId)!.is_default).to.be.false;
    expect(packageStorage.get(newDefaultPackageId)!.is_default).to.be.true;
  });
});
