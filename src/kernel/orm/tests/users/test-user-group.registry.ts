import { SessionDBClient } from "../../../services/database/sessiondb/sessiondb";
import { RegistryRepository } from "../../repository/registry.repository";
import { TestUser } from "./test-user.model";
import { getTestUsers } from "./test-users";

const SessionDB = new SessionDBClient()
SessionDB.import({users: getTestUsers()})

export class TestUserGroupRegistry extends RegistryRepository<TestUser> {

  protected collection = 'users'
  protected reference  = 'group_id'
  protected providers  = {
    database: SessionDB
  }
  protected model      = new TestUser

}