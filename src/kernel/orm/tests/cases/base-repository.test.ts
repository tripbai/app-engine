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
        expect(err.message).to.include('required set of data that is not found')
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
        is_verified: false,
        enrolled_at: TimeStamp.now(),
        metadata: '{"citizenship":"Japanese"}'
      })
      const TestUserModel = await TestUserRepo.get()
      expect(() => {
        TestUserRepo.update({ first_name: 'Kevin' })
      }).to.throw('due to a logic error that occured')
    })
    it('should not contain reserved entity fields', async () => {
      const newUserId = Pseudorandom.alphanum32()
      const TestUserRepo = new TestUserRepository(newUserId)
      expect(() => {
        TestUserRepo.create({
          first_name: 'Elven',
          age: 25,
          is_verified: false,
          enrolled_at: TimeStamp.now(),
          metadata: '{"citizenship":"Japanese"}',
          // @ts-expect-error
          archived_at: TimeStamp.now()
        })
      }).to.throw('due to a logic error that occured')
    })
    it('should validate fields of TEntity', async () => {
      const newUserId = Pseudorandom.alphanum32()
      const TestUserRepo = new TestUserRepository(newUserId)
      expect(() => {
        TestUserRepo.create({
          first_name: 'Elven',
          age: 13,
          is_verified: false,
          enrolled_at: TimeStamp.now(),
          metadata: '{"citizenship":"Japanese"}',
        })
      }).to.throw('invalid syntax in the request')
    })
  })
})