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
import {
  getTimestampNow,
  normalizeTimestamp,
} from "../../../utilities/timestamp";
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
    it("should throw an error when created_at and updated_at fields received Date object", async () => {
      class TestEntity extends BaseEntity {
        @varchar()
        firstName!: string;
      }
      const entityId = createEntityId();
      const dateNow = new Date(Date.now());
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
            archived_at: null,
          };
          // @ts-expect-error - Type 'Date' is not assignable to type 'string'
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
      const baseRepository = new BaseRepository("test_collection", TestEntity, {
        database: databaseProvider,
        cache: cacheProvider,
      });
      try {
        await baseRepository.getByIdWithArchived(entityId);
      } catch (error) {
        expect(error).to.be.instanceOf(TypeError);
      }
    });
    it("should throw an error when it receives non-FlatDatabaseRecord type field values", async () => {
      class TestEntity extends BaseEntity {
        @varchar()
        firstName!: string;
      }
      const entityId = createEntityId();
      const dateNow = getTimestampNow();
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
            archived_at: { invalid: true },
          };
          // @ts-expect-error - Type 'object' is not assignable to archived_at
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
      const baseRepository = new BaseRepository("test_collection", TestEntity, {
        database: databaseProvider,
        cache: cacheProvider,
      });
      try {
        await baseRepository.getByIdWithArchived(entityId);
      } catch (error) {
        expect(error).to.be.instanceOf(TypeError);
      }
    });
    it("should store to cache if not exists", async () => {
      class TestEntity extends BaseEntity {
        @varchar()
        firstName!: string;
      }
      const entityId = createEntityId();
      const dateNow = getTimestampNow();
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
            archived_at: null,
          };
          return [data];
        }
      })();
      const cacheProvider = new (class extends MockCacheProvider {
        storedCache: string = "";
        async getItem({
          collection,
          entityId,
        }: CacheItem): Promise<string | null> {
          return null;
        }
        async addItem(
          { collection, entityId }: CacheItem,
          cacheContent: string
        ): Promise<string> {
          this.storedCache = cacheContent;
          return cacheContent;
        }
      })();
      const baseRepository = new BaseRepository("test_collection", TestEntity, {
        database: databaseProvider,
        cache: cacheProvider,
      });
      const result = await baseRepository.getByIdWithArchived(entityId);
      const flattenedRecord = flattenEntity(result);
      expect(flattenedRecord).to.deep.equal(
        JSON.parse(cacheProvider.storedCache)
      );
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
