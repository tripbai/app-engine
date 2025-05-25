import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserRepository } from "../users/test-user.repository"
import { TestUser } from "../users/test-user.model"
import { SessionDBClient } from "../../../services/database/sessiondb/sessiondb"
import { Pseudorandom } from "../../../helpers/pseudorandom"
import { TestUsers, getTestUsers } from "../users/test-users"


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
  })
})