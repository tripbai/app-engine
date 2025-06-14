import { describe, it } from "node:test";
import { expect } from 'chai'
import { Container } from "inversify";
import { bindDummyProviders } from "./dummy-providers";
import { CreateUserCommand } from "../../commands/create-user.command";
import { bind } from "../../../../bindings";
import { AbstractDatabaseProvider, DatabaseTransactionStep } from "../../../../core/providers/database/database.provider";
import { Pseudorandom } from "../../../../core/helpers/pseudorandom";

const container = new Container()
bind(container)
bindDummyProviders(container)
const createUserCommand = container.get(CreateUserCommand)

const seedDatabase = async () => {
  const database = container.get(AbstractDatabaseProvider)
  await database.useQuery({
    namespace: 'users',
    type: 'create',
    query: '',
    data: {
      entity_id: Pseudorandom.alphanum32()
    }
  })
}

describe('Create User Integration', async () => {
  await seedDatabase()
  it('should not create with invalid parameter combinations', async () => {
    try {
      // @ts-expect-error
      await createUserCommand.execute({
        provider: 'iauth',
        type: 'concrete',
        creation_context: 'external',
        role: 'webadmin',
        status: 'unverified'
      })
      throw new Error('the above did not throw an error')
    } catch (error) {
      expect(error.message).to.equal('unsupported create user workflow')
    }
  })
})