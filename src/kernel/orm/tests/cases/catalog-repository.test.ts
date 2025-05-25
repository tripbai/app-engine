import { describe, it } from "node:test"
import { expect } from 'chai'
import { TestUserRepository } from "../users/test-user.repository"
import { TestUser } from "../users/test-user.model"
import { SessionDBClient } from "../../../services/database/sessiondb/sessiondb"
import { Pseudorandom } from "../../../helpers/pseudorandom"
import { TestUsers, getTestUsers } from "../users/test-users"
import { TimeStamp } from "../../../helpers/timestamp"
import { TestUserCatalogRepository } from "../users/test-user.catalog"


const SessionDB = new SessionDBClient()
SessionDB.import({users: getTestUsers()})

describe('CatalogRepository tests', () => {
  describe('find()', () => {
    it('should retrieve users that match to a given set of entity_ids', async () => {
      const testUsers = await TestUserCatalogRepository.find([
        TestUsers['Frank'].entity_id,
        TestUsers['Ivan'].entity_id,
        TestUsers['Dave'].entity_id,
      ])
      expect(testUsers[1].first_name).to.equal('Ivan')
    })
    it('should skip non-existing records based on entity_ids', async () => {
      const testUsers = await TestUserCatalogRepository.find([
        TestUsers['Frank'].entity_id,
        Pseudorandom.alphanum32(),
        TestUsers['Dave'].entity_id,
      ])
      expect(testUsers[1].first_name).to.equal('Dave')
    })
    it('should fail entirely when one of the records have invalid data', async () => {
      try {
        const testUsers = await TestUserCatalogRepository.find([
          TestUsers['Frank'].entity_id,
          TestUsers['MinorJake'].entity_id,
        ])
        throw new Error('the above code did not throw an error')
      } catch (err) {
        expect(err.message).to.include('database record contains invalid data')
      }
    })
  })
})