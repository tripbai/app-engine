import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserRepository } from "../users/test-user.repository"
import { TestUser } from "../users/test-user.model"
import { SessionDBClient } from "../../../services/database/sessiondb/sessiondb"
import { Pseudorandom } from "../../../helpers/pseudorandom"
import { TestUsers, getTestUsers } from "../users/test-users"
import { TimeStamp } from "../../../helpers/timestamp"


const SessionDB = new SessionDBClient()
SessionDB.import({users: getTestUsers()})

describe('BaseRepository tests', () => {
  describe('get()', () => {
    it('should successfully retrieve existing data', async () => {
      const TestUserRepo = new TestUserRepository(TestUsers['John'].entity_id)
      TestUserRepo.setDatabaseProvider(SessionDB)
      const TestUserModel = await TestUserRepo.get()
      expect(TestUserModel.first_name).to.equal('John')
    })
    it('should not retrieve the same data twice from the database', async () => {
      const LocalSessionDB = new SessionDBClient()
      LocalSessionDB.import({users: getTestUsers()})
      const TestUserRepo = new TestUserRepository(TestUsers['Grace'].entity_id)
      TestUserRepo.setDatabaseProvider(LocalSessionDB)
      const TestUserModel = await TestUserRepo.get()
      const UserGrace = await TestUserRepo.get()
      expect(LocalSessionDB.stats().number_of_get_invocations).to.equal(1)
    })
    it('should throw an error when accessing non-existing record', async () => {
      const TestUserRepo = new TestUserRepository(Pseudorandom.alphanum32())
      try {
        await TestUserRepo.get()
        throw new Error()
      } catch (err) {
        expect(err.message).to.include('record not found from database')
      }
    })
  })
  describe('create()', ()=>{
    it('should allow to get after create', async () => {
      const newUserId = Pseudorandom.alphanum32()
      const TestUserRepo = new TestUserRepository(newUserId)
      TestUserRepo.create({
        first_name: 'Elven',
        age: 25,
        group_id: Pseudorandom.alphanum32(),
        is_verified: false,
        enrolled_at: TimeStamp.now(),
        metadata: '{"citizenship":"Japanese"}'
      })
      const TestUserModel = await TestUserRepo.get()
      expect(TestUserModel.first_name).to.equal('Elven')
    })
    it('should not allow to update after create', async () => {
      const newUserId = Pseudorandom.alphanum32()
      const TestUserRepo = new TestUserRepository(newUserId)
      TestUserRepo.create({
        first_name: 'Elven',
        age: 25,
        group_id: Pseudorandom.alphanum32(),
        is_verified: false,
        enrolled_at: TimeStamp.now(),
        metadata: '{"citizenship":"Japanese"}'
      })
      const TestUserModel = await TestUserRepo.get()
      expect(() => {
        TestUserRepo.update({ first_name: 'Kevin' })
      }).to.throw('attempts to do another transaction when it is locked to a certain state')
    })
    it('should not contain reserved entity fields', async () => {
      const newUserId = Pseudorandom.alphanum32()
      const TestUserRepo = new TestUserRepository(newUserId)
      expect(() => {
        TestUserRepo.create({
          first_name: 'Elven',
          age: 25,
          group_id: Pseudorandom.alphanum32(),
          is_verified: false,
          enrolled_at: TimeStamp.now(),
          metadata: '{"citizenship":"Japanese"}',
          // @ts-expect-error
          archived_at: TimeStamp.now()
        })
      }).to.throw('passing archived_at field name to base repository model not allowed')
    })
    it('should validate fields of TEntity', async () => {
      const newUserId = Pseudorandom.alphanum32()
      const TestUserRepo = new TestUserRepository(newUserId)
      expect(() => {
        TestUserRepo.create({
          first_name: 'Elven',
          age: 13,
          group_id: Pseudorandom.alphanum32(),
          is_verified: false,
          enrolled_at: TimeStamp.now(),
          metadata: '{"citizenship":"Japanese"}',
        })
      }).to.throw('create data contains one or more invalid fields')
    })
  })
  describe('update()', () => {
    it('should not allow to invoke update when model is not initialized', () => {
      const TestUserRepo = new TestUserRepository()
      expect(() => {
        TestUserRepo.update({ first_name: 'Kevin' })
      }).to.throw('attempt to do action on controller when model is not yet initialized')
    })
    it('should not allow to reserved entity fields', async () => {
      const TestUserRepo = new TestUserRepository(TestUsers['Ivan'].entity_id)
      TestUserRepo.setDatabaseProvider(SessionDB)
      const TestUserModel = await TestUserRepo.get()
      expect(() => {
        TestUserRepo.update({
          /** @ts-expect-error */
          created_at: TimeStamp.now()
        })
      }).to.throw('passing created_at field name to base repository model not allowed')
    })
    it('should validate fields of TEntity', async () => {
      const TestUserRepo = new TestUserRepository(TestUsers['Ivan'].entity_id)
      TestUserRepo.setDatabaseProvider(SessionDB)
      const TestUserModel = await TestUserRepo.get()
      expect(() => {
        TestUserRepo.update({
          age: 13,
        })
      }).to.throw('update data contains one or more invalid fields')
    })
  })
  describe('commit()', () => {
    it('should successfully commit create entity', async () => {
      const LocalSessionDB = new SessionDBClient()
      LocalSessionDB.import({users: getTestUsers()})
      const newUserId = Pseudorandom.alphanum32()
      const TestUserRepo = new TestUserRepository(newUserId)
      TestUserRepo.setDatabaseProvider(LocalSessionDB)
      TestUserRepo.create({
        first_name: 'Elven',
        age: 25,
        group_id: Pseudorandom.alphanum32(),
        is_verified: false,
        enrolled_at: TimeStamp.now(),
        metadata: '{"citizenship":"Japanese"}'
      })
      await TestUserRepo.commit()
      const TestTestUserRepo = new TestUserRepository(newUserId)
      TestTestUserRepo.setDatabaseProvider(LocalSessionDB)
      const TestTestUserModel = await TestTestUserRepo.get()
      expect(TestTestUserModel.entity_id).to.equal(newUserId)
    })
    it('should successfully commit update entity', async () => {
      const LocalSessionDB = new SessionDBClient()
      LocalSessionDB.import({users: getTestUsers()})
      const TestUserRepo = new TestUserRepository(TestUsers['Frank'].entity_id)
      TestUserRepo.setDatabaseProvider(LocalSessionDB)
      const TestUserModel = await TestUserRepo.get()
      TestUserRepo.update({age: 50})
      await TestUserRepo.commit()
      const TestTestUserRepo = new TestUserRepository(TestUsers['Frank'].entity_id)
      TestTestUserRepo.setDatabaseProvider(LocalSessionDB)
      const TestTestUserModel = await TestTestUserRepo.get()
      expect(TestTestUserModel.age).to.equal(50)
    })
    it('should successfully clear cached data after update', async () => {
      const LocalSessionDB3 = new SessionDBClient()
      LocalSessionDB3.import({users: getTestUsers()})
      const TestUserRepo = new TestUserRepository(TestUsers['Eve'].entity_id)
      TestUserRepo.setDatabaseProvider(LocalSessionDB3)
      const TestUserModel = await TestUserRepo.get()
      TestUserRepo.update({age: 50})
      await TestUserRepo.commit()
      const TestTestUserRepo = new TestUserRepository(TestUsers['Eve'].entity_id)
      TestTestUserRepo.setDatabaseProvider(LocalSessionDB3)
      const TestTestUserModel = await TestTestUserRepo.get()
      expect(LocalSessionDB3.stats().number_of_get_invocations).to.equal(2)
    })
  })
})