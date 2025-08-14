import { describe, it } from "node:test";
import { assert, expect } from "chai";
import { BaseEntity } from "../../entity/base-entity";
import {
  AbstractDatabaseProvider,
  FlatDatabaseRecord,
} from "../../../providers/database/database.provider";
import {
  AbstractCacheProvider,
  CacheItem,
} from "../../../providers/cache/cache.provider";
import { collection, varchar } from "../../entity/entity-decorators";
import { BaseRepository } from "../../repository/base-repository";
import {
  createEntityId,
  flattenEntity,
} from "../../../utilities/entityToolkit";
import { getTimestampNow } from "../../../utilities/timestamp";
import { MockDatabaseProvider } from "../../../providers/database/mock/mock-database-provider";
import { MockCacheProvider } from "../../../providers/cache/mock/mock-cache-provider";
import * as Core from "../../../module/types";
import { DataIntegrityException } from "../../../exceptions/exceptions";

describe("BaseRepository", () => {
  describe("getByIdWithArchived", () => {
    it("should attempt to retrieve data from cache first", async () => {
      class TestEntity extends BaseEntity {
        @varchar()
        firstName!: string;
      }
      const entityId = createEntityId();
      const databaseProvider = new (class extends MockDatabaseProvider {
        async getRecordById(
          collection: string,
          id: Core.Entity.Id
        ): Promise<FlatDatabaseRecord[]> {
          throw new Error("Should not reach here, cache should be used first");
        }
      })();
      const cacheProvider = new (class extends MockCacheProvider {
        async getItem({
          collection,
          entityId,
        }: CacheItem): Promise<string | null> {
          return JSON.stringify({
            entity_id: entityId,
            created_at: dateNow,
            updated_at: dateNow,
            archived_at: null,
            firstName: "John",
          });
        }
      })();
      const dateNow = getTimestampNow();
      const baseRepository = new BaseRepository("test_collection", TestEntity, {
        database: databaseProvider,
        cache: cacheProvider,
      });
      const result = await baseRepository.getByIdWithArchived(entityId);
      const flattenedRecord = flattenEntity(result);
      expect(flattenedRecord).to.deep.equal({
        entity_id: entityId,
        created_at: dateNow,
        updated_at: dateNow,
        archived_at: null,
        firstName: "John",
      });
    });
    it("should retrieve from database if cache returns null", async () => {
      class TestEntity extends BaseEntity {
        @varchar()
        firstName!: string;
      }
      const entityId = createEntityId();
      const databaseProvider = new (class extends MockDatabaseProvider {
        async getRecordById(
          collection: string,
          id: Core.Entity.Id
        ): Promise<FlatDatabaseRecord[]> {
          const data = {
            entity_id: entityId,
            created_at: dateNow,
            updated_at: dateNow,
            archived_at: null,
            firstName: "John",
          };
          return [data];
        }
      })();
      const cacheProvider = new (class extends MockCacheProvider {
        async getItem({
          collection,
          entityId,
        }: CacheItem): Promise<string | null> {
          return null;
        }
      })();
      const dateNow = getTimestampNow();
      const baseRepository = new BaseRepository("test_collection", TestEntity, {
        database: databaseProvider,
        cache: cacheProvider,
      });
      const result = await baseRepository.getByIdWithArchived(entityId);
      const flattenedRecord = flattenEntity(result);
      expect(flattenedRecord).to.deep.equal({
        entity_id: entityId,
        created_at: dateNow,
        updated_at: dateNow,
        archived_at: null,
        firstName: "John",
      });
    });
    it("should throw DataIntegrityException if data has missing required fields", async () => {
      class TestEntity extends BaseEntity {
        @varchar()
        firstName!: string;
      }
      const entityId = createEntityId();
      const databaseProvider = new (class extends MockDatabaseProvider {
        async getRecordById(
          collection: string,
          id: Core.Entity.Id
        ): Promise<FlatDatabaseRecord[]> {
          const data = {
            entity_id: entityId,
            created_at: dateNow,
            updated_at: dateNow,
            firstName: "John",
          };
          return [data];
        }
      })();
      const cacheProvider = new (class extends MockCacheProvider {
        async getItem({
          collection,
          entityId,
        }: CacheItem): Promise<string | null> {
          return null;
        }
      })();
      const dateNow = getTimestampNow();
      const baseRepository = new BaseRepository("test_collection", TestEntity, {
        database: databaseProvider,
        cache: cacheProvider,
      });
      try {
        await baseRepository.getByIdWithArchived(entityId);
      } catch (error) {
        expect(error).to.be.instanceOf(DataIntegrityException);
      }
    });
  });
  describe("getFromCacheById", () => {
    it("should throw DataIntegrityException if cached data is not parsable", async () => {
      class TestEntity extends BaseEntity {
        @varchar()
        firstName!: string;
      }
      const entityId = createEntityId();
      const databaseProvider = new (class extends MockDatabaseProvider {
        async getRecordById(
          collection: string,
          id: Core.Entity.Id
        ): Promise<FlatDatabaseRecord[]> {
          throw new Error("Should not reach here, cache should be used first");
        }
      })();
      const cacheProvider = new (class extends MockCacheProvider {
        async getItem({
          collection,
          entityId,
        }: CacheItem): Promise<string | null> {
          return "invalid json";
        }
      })();
      const baseRepository = new BaseRepository("test_collection", TestEntity, {
        database: databaseProvider,
        cache: cacheProvider,
      });
      try {
        await baseRepository.getByIdWithArchived(entityId);
      } catch (error) {
        expect(error).to.be.instanceOf(DataIntegrityException);
      }
    });
  });
});
