import { describe, it } from "node:test";
import { expect } from "chai";
import { Container } from "inversify";
import { bind } from "../../../../bindings";
import { bindTripBaiTestProviders } from "../../../module/dummy-providers";
import { PackageUpdateService } from "../../services/package-update.service";
import { Pseudorandom } from "../../../../core/helpers/pseudorandom";
import { PackageModel } from "../../package.model";
import { UnitOfWorkFactory } from "../../../../core/workflow/unit-of-work.factory";
import { MockDatabaseProvider } from "../../../../core/providers/database/mock/mock-database.provider";
import { MockCacheProvider } from "../../../../core/providers/cache/mock/mock-cache.provider";
import {
  AbstractDatabaseProvider,
  DatabaseTransactionStep,
  FlatDatabaseRecord,
} from "../../../../core/providers/database/database.provider";
import { AbstractCacheProvider } from "../../../../core/providers/cache/cache.provider";
import { TimeStamp } from "../../../../core/helpers/timestamp";
import { Core } from "../../../../core/module/module";
import { PackageRepository } from "../../package.repository";
import { TransientMockDatabase } from "../../../../core/providers/database/mock/transient-database";

const container = new Container();
bindTripBaiTestProviders(container);
bind(container);

const existingPackage1Id = createEntityId();
const existingPackage1: PackageModel = {
  entity_id: existingPackage1Id,
  name: "Existing Package 1",
  is_active: true,
  is_default: false,
  created_at: TimeStamp.now(),
  updated_at: TimeStamp.now(),
  archived_at: null,
};
const existingPackage2Id = createEntityId();
const existingPackage2: PackageModel = {
  entity_id: existingPackage2Id,
  name: "Existing Package 2",
  is_active: true,
  is_default: true,
  created_at: TimeStamp.now(),
  updated_at: TimeStamp.now(),
  archived_at: null,
};

// @ts-ignore
const exitingRecords: Map<Core.Entity.Id, FlatDatabaseRecord> = new Map([
  [existingPackage1Id, existingPackage1],
  [existingPackage2Id, existingPackage2],
]);

class TestDatabaseProvider extends TransientMockDatabase {
  protected dataStorage: Map<string, Map<Core.Entity.Id, FlatDatabaseRecord>> =
    new Map([["packages", exitingRecords]]);
}
class TestCacheProvider extends MockCacheProvider {}
container.bind(AbstractDatabaseProvider).to(TestDatabaseProvider);
container.bind(AbstractCacheProvider).to(TestCacheProvider);

describe("PackageUpdateService", () => {
  describe("updatePackage", () => {
    it("should update package details correctly", async () => {
      const packageUpdateService = container.get(PackageUpdateService);
      const unitOfWorkFactory = container.get(UnitOfWorkFactory);
      const packageRepository = container.get(PackageRepository);
      const unitOfWork = unitOfWorkFactory.create();
      const packageModel = await packageRepository.getById(existingPackage1Id);
      await packageUpdateService.updatePackage(
        unitOfWork, // UnitOfWork is not used in this test
        packageModel,
        {
          name: "Updated Package Name",
          is_active: true,
          is_default: false,
        }
      );
      await unitOfWork.commit(); // Commit the changes
      const result = await packageRepository.getById(existingPackage1Id);
      expect(result).to.have.property("name", "Updated Package Name");
      expect(result).to.have.property("is_active", true);
      expect(result).to.have.property("is_default", false);
    });

    it("should throw error if trying to set package as non-default when it is the only default package", async () => {
      const packageUpdateService = container.get(PackageUpdateService);
      const unitOfWorkFactory = container.get(UnitOfWorkFactory);
      const packageRepository = container.get(PackageRepository);
      const unitOfWork = unitOfWorkFactory.create();
      const packageModel = await packageRepository.getById(existingPackage2Id);
      try {
        await packageUpdateService.updatePackage(unitOfWork, packageModel, {
          name: "Updated Package Name",
          is_active: true,
          is_default: false,
        });
        expect.fail("Expected error not thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.include("Cannot set package as non-default");
      }
    });

    it("should swap default package when updating", async () => {
      const packageUpdateService = container.get(PackageUpdateService);
      const unitOfWorkFactory = container.get(UnitOfWorkFactory);
      const packageRepository = container.get(PackageRepository);
      const unitOfWork = unitOfWorkFactory.create();
      const packageModel = await packageRepository.getById(existingPackage1Id);
      await packageUpdateService.updatePackage(unitOfWork, packageModel, {
        name: "Updated Package Name",
        is_active: true,
        is_default: true,
      });
      await unitOfWork.commit(); // Commit the changes
      const result = await packageRepository.getById(existingPackage1Id);
      expect(result).to.have.property("name", "Updated Package Name");
      expect(result).to.have.property("is_active", true);
      expect(result).to.have.property("is_default", true);

      const packageModel2 = await packageRepository.getById(existingPackage2Id);
      expect(packageModel2).to.have.property("is_default", false);
    });
  });
});
