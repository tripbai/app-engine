import { describe, it } from "node:test";
import { expect } from 'chai'
import { Container } from "inversify";
import { bindDummyProviders } from "./dummy-providers";
import { CreateUserCommand } from "../../commands/create-user.command";
import { bind } from "../../../../bindings";
import { AbstractDatabaseProvider, DatabaseTransactionStep } from "../../../../core/providers/database/database.provider";
import { getAnthonyFromFireAuthUserModel, getJohnUserModel, getKyleProfileModel, getKyleUserModel, getLucyFromGoogleProfileModel, getLucyFromGoogleUserModel, getMiguelProfileModel, getMiguelUserModel } from "./dummy-users";
import { IdentityAuthority } from "../../../module/module.interface";
import { Pseudorandom } from "../../../../core/helpers/pseudorandom";
import { TimeStamp } from "../../../../core/helpers/timestamp";
import { UserAccessReportService } from "../../services/user-access-report.service";

const container = new Container()
bindDummyProviders(container)
bind(container)
const createUserCommand = container.get(CreateUserCommand)

const suspendedUserEmail = 'kylesuspended1@example.com' 
const activeUserEmail = 'miguelactive1@example.com'
const deactivatedUserEmail = 'kyledeactivated1@example.com'

const seedDatabase = async () => {
  const database = container.get(AbstractDatabaseProvider)

  /** Suspended user for testing */
  const suspendedUserEntityId = Pseudorandom.alphanum32()
  const SuspendedUseruserModel = await getKyleUserModel()
  const SuspendedUserProfileModel = await getKyleProfileModel()
  SuspendedUseruserModel.entity_id = suspendedUserEntityId
  SuspendedUseruserModel.suspended_until = TimeStamp.now()
  SuspendedUseruserModel.status = 'suspended'

  // @ts-expect-error
  SuspendedUseruserModel.email_address = 'kylesuspended1@example.com'
  // @ts-expect-error
  SuspendedUseruserModel.username = 'kylesuspended1'
  SuspendedUserProfileModel.entity_id = suspendedUserEntityId

  /** Active user for testing */
  const activeUserEntityId = Pseudorandom.alphanum32()
  const ActiveUserUserModel = await getMiguelUserModel()
  ActiveUserUserModel.entity_id = activeUserEntityId
  // @ts-expect-error
  ActiveUserUserModel.email_address = activeUserEmail
  // @ts-expect-error
  ActiveUserUserModel.username = 'miguelactive1'
  ActiveUserUserModel.status = 'active'
  ActiveUserUserModel.is_email_verified = true
  ActiveUserUserModel.verified_since = '2024-12-01 11:23:21'
  const ActiveUserUserProfile = await getMiguelProfileModel()
  ActiveUserUserProfile.entity_id = activeUserEntityId

  /** Deactivated user for testing */
  const deactivatedUserEntityId = Pseudorandom.alphanum32()
  const DeactivatedUserUserModel = await getKyleUserModel()
  DeactivatedUserUserModel.entity_id = deactivatedUserEntityId
  // @ts-expect-error
  DeactivatedUserUserModel.email_address = deactivatedUserEmail
  // @ts-expect-error
  DeactivatedUserUserModel.username = 'kyledeactivated1'
  DeactivatedUserUserModel.status = 'deactivated'
  const DeactivatedUserProfileModel = await getKyleProfileModel()
  DeactivatedUserProfileModel.entity_id = deactivatedUserEntityId

  /** Fireauth user for testing */
  const FireAuthUserUserModel = await getAnthonyFromFireAuthUserModel()
  const GoogleUserUserModel = await getLucyFromGoogleUserModel()

  await database.useQuery({
    type: 'create',
    query: 'users',
    // @ts-expect-error
    data: SuspendedUseruserModel
  })
  await database.useQuery({
    type: 'create',
    query: 'profiles',
    // @ts-expect-error
    data: SuspendedUserProfileModel
  })

  await database.useQuery({
    type: 'create',
    query: 'users',
    // @ts-expect-error
    data: ActiveUserUserModel
  })
  await database.useQuery({
    type: 'create',
    query: 'profiles',
    // @ts-expect-error
    data: ActiveUserUserProfile
  })

  await database.useQuery({
    type: 'create',
    query: 'users',
    // @ts-expect-error
    data: DeactivatedUserUserModel
  })
  await database.useQuery({
    type: 'create',
    query: 'profiles',
    // @ts-expect-error
    data: DeactivatedUserProfileModel
  })

  await database.useQuery({
    type: 'create',
    query: 'users',
    // @ts-expect-error
    data: FireAuthUserUserModel
  })

  await database.useQuery({
    type: 'create',
    query: 'users',
    // @ts-expect-error
    data: GoogleUserUserModel
  })
}

describe('Access User Integration', async () => {

  await seedDatabase()

  it('should return is_user_registered=false when the email address does not exist', async () => {
    const userAccessReportService = container.get(UserAccessReportService)
    try {
      const report = await userAccessReportService.createAccessReport({
        provider: 'iauth',
        email_address: 'nonexistent@example.com' as IdentityAuthority.Users.Fields.EmailAddress,
        password: 'helloworld143!' as IdentityAuthority.Users.Fields.RawPassword
      })
      expect(report.is_user_registered).to.equal(false)
    } catch (error) {
      expect(error.message).to.equal('should not throw an error')
    }
  })

  it('should throw an error for fireauth hosted users', async () => {
    const userAccessReportService = container.get(UserAccessReportService)
    const fireAuthUser = await getAnthonyFromFireAuthUserModel()
    try {
      await userAccessReportService.createAccessReport({
        provider: 'fireauth',
        // @ts-expect-error()
        email_address: fireAuthUser.email_address,
        password: 'helloworld143!' as IdentityAuthority.Users.Fields.RawPassword
      })
      throw new Error('the above did not throw an error')
    } catch (error) {
      expect(error.message).to.equal('fireauth hosted users cannot use this method')
    }
  })

  it('should throw an error for google hosted users', async () => {
    const userAccessReportService = container.get(UserAccessReportService)
    const googleUser = await getLucyFromGoogleUserModel()
    try {
      await userAccessReportService.createAccessReport({
        provider: 'google',
        // @ts-expect-error()
        email_address: googleUser.email_address,
        password: 'helloworld143!' as IdentityAuthority.Users.Fields.RawPassword
      })
      throw new Error('the above did not throw an error')
    } catch (error) {
      expect(error.message).to.equal('google hosted users cannot use this method')
    }
  })

  it('should return access_type=prohibited for suspended user', async () => {
    const userAccessReportService = container.get(UserAccessReportService)
    try {
      const report = await userAccessReportService.createAccessReport({
        provider: 'iauth',
        email_address: suspendedUserEmail as IdentityAuthority.Users.Fields.EmailAddress,
        password: 'helloworld143!' as IdentityAuthority.Users.Fields.RawPassword
      })
      expect(report).to.deep.include({
        access_type: 'prohibited',
        is_user_registered: true,
        user_status: 'suspended'
      })
      // @ts-expect-error
      expect(report.user_id).to.be.a('string')
    } catch (error) {
      expect(error.message).to.equal('should not throw an error')
    }
  })

  it('should return access_type=limited for deactivated user', async () => {
    const userAccessReportService = container.get(UserAccessReportService)
    try {
      const report = await userAccessReportService.createAccessReport({
        provider: 'iauth',
        email_address: deactivatedUserEmail as IdentityAuthority.Users.Fields.EmailAddress,
        password: 'helloworld143!' as IdentityAuthority.Users.Fields.RawPassword
      })
      expect(report).to.deep.include({
        access_type: 'limited',
        is_user_registered: true,
        user_status: 'deactivated'
      })
      // @ts-expect-error
      expect(report.token).to.be.a('string')
      // @ts-expect-error
      expect(report.user_id).to.be.a('string')
    } catch (error) {
      expect(error.message).to.equal('should not throw an error')
    }
    
  })

  it('should return access_type=allowed for active user', async () => {
    const userAccessReportService = container.get(UserAccessReportService)
    try {
      const report = await userAccessReportService.createAccessReport({
        provider: 'iauth',
        email_address: activeUserEmail as IdentityAuthority.Users.Fields.EmailAddress,
        password: 'helloworld143!' as IdentityAuthority.Users.Fields.RawPassword
      })
      expect(report).to.deep.include({
        access_type: 'allowed',
        is_user_registered: true,
        user_status: 'active'
      })
      // @ts-expect-error
      expect(report.token).to.be.a('string')
      // @ts-expect-error
      expect(report.user_id).to.be.a('string')
    } catch (error) {
      expect(error.message).to.equal('should not throw an error')
    }
    
  })

})
