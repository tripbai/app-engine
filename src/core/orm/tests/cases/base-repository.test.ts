import { describe, it } from "node:test"
import { expect } from 'chai'
import { Container } from "inversify"
import { AbstractDatabaseProvider, FlatDatabaseRecord } from "../../../providers/database/database.provider"
import { Core } from "../../../core.types"
import { TestUserRepository } from "../users/test-user.repository"
import { AbstractCacheProvider, CacheItem } from "../../../providers/cache/cache.provider"
import { MockDatabaseProvider } from "../../../providers/database/mock/mock-database.provider"
import { MockCacheProvider } from "../../../providers/cache/mock/mock-cache.provider"
import { Pseudorandom } from "../../../helpers/pseudorandom"
import { BaseEntity } from "../../entity/base-entity"
import { TestUserModel } from "../users/test-user.model"
import { BaseRepository } from "../../repository/base-repository"

describe('BaseRepository', () => {

  describe('get()', () => {
    it('should successfully retrieve data from cache, if available', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      const user: TestUserModel = {
        entity_id: userId,
        first_name: 'Kurt',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`,
        created_at: '2024-12-01 11:23:21',
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      class TestCache extends MockCacheProvider {
        async getItem({ collection, entityId }: CacheItem): Promise<string | null> {
            return JSON.stringify(user)
        }
      }
      class TestDatabase extends MockDatabaseProvider {
        async getRecordById(collectionName: string, id: Core.Entity.Id) {
            return []
        }
      }
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      const UserModel = await TestUserRepo.getById(userId)
      expect(UserModel.first_name).to.equal('Kurt')
    })
    it('should throw an error when data is not found in both cache and database', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      class TestCache extends MockCacheProvider {
        async getItem({ collection, entityId }: CacheItem): Promise<string | null> {
            return null
        }
      }
      class TestDatabase extends MockDatabaseProvider {
        async getRecordById(collectionName: string, id: Core.Entity.Id) {
            return []
        }
      }
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      try {
        const UserModel = await TestUserRepo.getById(userId)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('record not found from database')
      }
    })
    it('should throw an error when data from cache is not json-parsable', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      class TestCache extends MockCacheProvider {
        async getItem({ collection, entityId }: CacheItem): Promise<string | null> {
            return '{"user_id}'
        }
      }
      class TestDatabase extends MockDatabaseProvider {
        async getRecordById(collectionName: string, id: Core.Entity.Id) {
            return []
        }
      }
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      try {
        const UserModel = await TestUserRepo.getById(userId)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('cached json data is not parsable')
      }
    })
    it('should throw an error when multiple records were retrieved for the same id', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      const user1: TestUserModel = {
        entity_id: userId,
        first_name: 'John',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`,
        created_at: '2024-12-01 11:23:21',
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      const user2: TestUserModel = {
        entity_id: userId,
        first_name: 'Ivan',
        age: 45,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"Brazilian"}`,
        created_at: '2024-12-01 11:23:21',
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {
        async getRecordById(collectionName: string, id: Core.Entity.Id) {
            return [BaseRepository.flattenAsDatabaseRecord(user1), BaseRepository.flattenAsDatabaseRecord(user2)]
        }
      }
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      try {
        const UserModel = await TestUserRepo.getById(userId)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('multiple records under the same entity_id and collection')
      }
    })
    it('should throw an error when there is a missing field in the retrieved data', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      // @ts-expect-error - missing created_at for testing
      const user: TestUserModel = {
        entity_id: userId,
        first_name: 'John',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`,
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {
        async getRecordById(collectionName: string, id: Core.Entity.Id) {
            return [BaseRepository.flattenAsDatabaseRecord(user)]
        }
      }
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      try {
        const UserModel = await TestUserRepo.getById(userId)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('database record has missing required entity fields')
      }
    })
    it('should throw an error when there is invalid field in the data', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      const user: TestUserModel = {
        entity_id: userId,
        first_name: 'John',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`,
        created_at: '202412-01Q11:23:21S',
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {
        async getRecordById(collectionName: string, id: Core.Entity.Id) {
            return [BaseRepository.flattenAsDatabaseRecord(user)]
        }
      }
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      try {
        const UserModel = await TestUserRepo.getById(userId)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('database record contains invalid data')
      }
    })
    it('should successfully retrieve data from database', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      const user: TestUserModel = {
        entity_id: userId,
        first_name: 'John',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`,
        created_at: '2024-12-01 11:23:21',
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {
        async getRecordById(collectionName: string, id: Core.Entity.Id) {
            return [BaseRepository.flattenAsDatabaseRecord(user)]
        }
      }
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      const UserModel = await TestUserRepo.getById(userId)
      expect(UserModel.first_name).to.equal('John')
    })
  })

  describe('import()', () => {
    it('should validate data when importing', () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      const userWithIncorrectCreatedAtField: Readonly<Record<keyof TestUserModel, string | number | boolean | Core.Entity.Id | null | undefined>> = {
        id: null,
        entity_id: userId,
        first_name: 'John',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`,
        created_at: '202412-01Q11:23:21S',
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {}
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      try {
        TestUserRepo.import(userWithIncorrectCreatedAtField)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('imported record contains invalid data')
      }
    })
    it('should successfully import data without error', () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      const UserModel: Readonly<Record<keyof TestUserModel, string | number | boolean | Core.Entity.Id | null | undefined>> = {
        id: null,
        entity_id: userId,
        first_name: 'John',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`,
        created_at: '2024-12-01 11:23:21',
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {}
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      TestUserRepo.import(UserModel)
      expect(TestUserRepo.hasModelInitialized()).to.equal(true)
    })
  })

  describe('create()', () => {
    it('should throw an error when the action is locked to update', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      const user: TestUserModel = {
        entity_id: userId,
        first_name: 'John',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`,
        created_at: '2024-12-01 11:23:21',
        updated_at: '2024-12-01 11:23:21',
        archived_at: null
      }
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {
        async getRecordById(collectionName: string, id: Core.Entity.Id) {
            return [BaseRepository.flattenAsDatabaseRecord(user)]
        }
      }
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      const TestUser = await TestUserRepo.getById(userId)
      TestUserRepo.update({
        age: 30
      })
      try {
        TestUserRepo.create(userId, {
          first_name: 'John',
          age: 23,
          is_verified: true,
          enrolled_at: '2024-12-04 11:23:21',
          group_id: Pseudorandom.alphanum32(),
          metadata: `{"citizenship":"American"}`
        })
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('Attempts to do another action when it is locked to a certain state')
      }
    })

    it('should throw an error when the create data contains reserved fields', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {}
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      try {
        TestUserRepo.create(userId, {
          first_name: 'John',
          age: 23,
          is_verified: true,
          enrolled_at: '2024-12-04 11:23:21',
          group_id: Pseudorandom.alphanum32(),
          metadata: `{"citizenship":"American"}`,
          // @ts-expect-error
          created_at: '2024-12-04 11:23:21'
        })
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('Attempts to override reserved entity fields')
      }
    })

    it('should throw an error when the create data contains invalid fields', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {}
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      try {
        TestUserRepo.create(userId, {
          first_name: 'John',
          age: 23,
          is_verified: true,
          enrolled_at: '2024-12-04INVALID11:23:21',
          group_id: Pseudorandom.alphanum32(),
          metadata: `{"citizenship":"American"}`
        })
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.equal('create data contains one or more invalid fields')
      }
    })

    it('should successfully create the model and populate the reserved fields', async () => {
      const container = new Container()
      const userId = Pseudorandom.alphanum32()
      class TestCache extends MockCacheProvider {}
      class TestDatabase extends MockDatabaseProvider {}
      container.bind(TestUserModel).toSelf()
      container.bind(AbstractDatabaseProvider).to(TestDatabase)
      container.bind(AbstractCacheProvider).to(TestCache)
      container.bind(TestUserRepository).toSelf()
      const TestUserRepo = container.get(TestUserRepository)
      TestUserRepo.create(userId, {
        first_name: 'John',
        age: 23,
        is_verified: true,
        enrolled_at: '2024-12-04 11:23:21',
        group_id: Pseudorandom.alphanum32(),
        metadata: `{"citizenship":"American"}`
      })
      const TestUser = await TestUserRepo.getById(userId)
      expect(TestUser.archived_at).to.equal(null)
    })
  })
})