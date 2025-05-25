import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserRepository } from "../users/test-user.repository"
import { TestUser } from "../users/test-user.model"
import { SessionDBClient } from "../../../services/database/sessiondb/sessiondb"
import { Pseudorandom } from "../../../helpers/pseudorandom"
import { TestUsers, getTestUsers } from "../users/test-users"
import { TimeStamp } from "../../../helpers/timestamp"
import { TestUserGroupRegistry } from "../users/test-user-group.registry"

describe('RegistryRepository tests', () => {
  describe('getAll()', () => {
    it('should successfully retrieve all existing active registry records', async () => {
      const TestUserGroup = new TestUserGroupRegistry(TestUsers['Alice'].group_id)
      const AllUsersWithinAliceGroup = await TestUserGroup.getAll()
      expect(AllUsersWithinAliceGroup.length).to.equal(4)
    })
    it('should fail entirely when one of the records have invalid data', async () => {
      const TestUserGroup = new TestUserGroupRegistry(TestUsers['Ivan'].group_id)
      try {
        const AllUsersWithinMinorJakeGroup = await TestUserGroup.getAll()
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.include('one of registry records contains invalid data')
      }
    })
  })
  describe('get()', () => {
    it('should successfully retrieve one of the existing records in registry', async () => {
      const TestUserGroup = new TestUserGroupRegistry(TestUsers['Alice'].group_id)
      const UserJohn = await TestUserGroup.get(TestUsers['John'].entity_id)
      expect(UserJohn.first_name).to.equal('John')
    })
    it('should throw an error when retrieving non existing record in registry', async () => {
      const TestUserGroup = new TestUserGroupRegistry(TestUsers['Alice'].group_id)
      try {
        const UserIvan = await TestUserGroup.get(TestUsers['Ivan'].entity_id)
        throw new Error('the above code did not throw an error')
      } catch (error) {
        expect(error.message).to.include('record not found from registry')
      }
    })
  })
})