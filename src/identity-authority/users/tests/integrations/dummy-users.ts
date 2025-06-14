import { Pseudorandom } from "../../../../core/helpers/pseudorandom";
import { Core } from "../../../../core/module/module";
import { IdentityAuthority } from "../../../module/module.interface";
import { ProfileModel } from "../../../profiles/profile.model";
import { UserOTPService } from "../../services/user-otp.service";
import { UserPasswordService } from "../../services/user-password.service";
import { UserModel } from "../../user.model";

const createPasswordHash = (password: string) => {
  const userPasswordService = new UserPasswordService()
  return userPasswordService.hashPassword(password as IdentityAuthority.Users.Fields.RawPassword)
}

const createOtpSecret = () => {
  const userOtpService = new UserOTPService()
  return userOtpService.generateOtpSecret()
}

export const getJohnUserModel = async () => {
  const John: UserModel = {
    entity_id: '6edab8226641480f917a3831ecc6c084' as Core.Entity.Id,
    identity_provider: 'iauth',
    email_address: 'john@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'mrjohn2025' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: false,
    verified_since: null,
    suspended_until: null,
    creation_context: 'external',
    password_hash: await createPasswordHash('helloworld143!'),
    role: 'user',
    status: 'unverified',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return John
}

export const getJohnProfileModel = async () => {
  const John: ProfileModel = {
    entity_id: '6edab8226641480f917a3831ecc6c084' as Core.Entity.Id,
    first_name: 'John' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'Denver' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'Hi! I am John',
    archived_at: null
  }
  return John
}

export const getKyleUserModel = async () => {
  const Kyle: UserModel = {
    entity_id: 'bcdf91e3a72649b9a1a2be489dc90f0d' as Core.Entity.Id,
    identity_provider: 'iauth',
    email_address: 'kyle@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'kyle_rocks' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: true,
    verified_since: '2024-12-01 11:23:21',
    suspended_until: null,
    creation_context: 'external',
    password_hash: await createPasswordHash('helloworld143!'),
    role: 'user',
    status: 'active',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return Kyle
}

export const getKyleProfileModel = async () => {
  const Kyle: ProfileModel = {
    entity_id: 'bcdf91e3a72649b9a1a2be489dc90f0d' as Core.Entity.Id,
    first_name: 'Kyle' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'Mathews' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'Hey there! Kyle here.',
    archived_at: null
  }
  return Kyle
}

export const getLaraUserModel = async () => {
  const Lara: UserModel = {
    entity_id: '44f14e0584f74071a837eeb88633ea9f' as Core.Entity.Id,
    identity_provider: 'iauth',
    email_address: 'lara@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'lara23' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: false,
    verified_since: null,
    suspended_until: null,
    creation_context: 'external',
    password_hash: await createPasswordHash('helloworld143!'),
    role: 'user',
    status: 'unverified',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return Lara
}

export const getLaraProfileModel = async () => {
  const Lara: ProfileModel = {
    entity_id: '44f14e0584f74071a837eeb88633ea9f' as Core.Entity.Id,
    first_name: 'Lara' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'Croft' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'Explorer. Adventurer. Gamer.',
    archived_at: null
  }
  return Lara
}

export const getMiguelUserModel = async () => {
  const Miguel: UserModel = {
    entity_id: 'f0b82de25a944e588ae8935eaa02b9bc' as Core.Entity.Id,
    identity_provider: 'iauth',
    email_address: 'miguel@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'miguel88' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: true,
    verified_since: '2024-12-01 11:23:21',
    suspended_until: null,
    creation_context: 'external',
    password_hash: await createPasswordHash('helloworld143!'),
    role: 'user',
    status: 'active',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return Miguel
}

export const getMiguelProfileModel = async () => {
  const Miguel: ProfileModel = {
    entity_id: 'f0b82de25a944e588ae8935eaa02b9bc' as Core.Entity.Id,
    first_name: 'Miguel' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'Santos' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'Coffee lover and tech nerd.',
    archived_at: null
  }
  return Miguel
}

export const getEmilyUserModel = async () => {
  const Emily: UserModel = {
    entity_id: 'ab7e2b12c34341d2a5e038c6d1d3f2b9' as Core.Entity.Id,
    identity_provider: 'iauth',
    email_address: 'emily@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'emilyrose' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: false,
    verified_since: null,
    suspended_until: null,
    creation_context: 'external',
    password_hash: await createPasswordHash('helloworld143!'),
    role: 'user',
    status: 'unverified',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return Emily
}

export const getEmilyProfileModel = async () => {
  const Emily: ProfileModel = {
    entity_id: 'ab7e2b12c34341d2a5e038c6d1d3f2b9' as Core.Entity.Id,
    first_name: 'Emily' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'Rose' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'Writer by heart, coder by passion.',
    archived_at: null
  }
  return Emily
}

export const getNoahUserModel = async () => {
  const Noah: UserModel = {
    entity_id: 'df17a17e23574d41be17190a7ae378b5' as Core.Entity.Id,
    identity_provider: 'iauth',
    email_address: 'noah@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'noahwave' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: true,
    verified_since: '2024-12-01 11:23:21',
    suspended_until: null,
    creation_context: 'external',
    password_hash: await createPasswordHash('helloworld143!'),
    role: 'user',
    status: 'active',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return Noah
}

export const getNoahProfileModel = async () => {
  const Noah: ProfileModel = {
    entity_id: 'df17a17e23574d41be17190a7ae378b5' as Core.Entity.Id,
    first_name: 'Noah' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'Stone' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'Builder of dreams and software.',
    archived_at: null
  }
  return Noah
}

export const getWebAdminUserModel = async () => {
  const WebAdmin: UserModel = {
    entity_id: 'V6It2ohfRXy8UpjovP6Tnv1XhhNoTYLH' as Core.Entity.Id,
    identity_provider: 'iauth',
    email_address: 'webadmin@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'webadmin' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: true,
    verified_since: '2024-12-01 11:23:21',
    suspended_until: null,
    creation_context: 'external',
    password_hash: await createPasswordHash('helloworld143!'),
    role: 'webadmin',
    status: 'active',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return WebAdmin
}

export const getWebAdminProfileModel = async () => {
  const WebAdmin: ProfileModel = {
    entity_id: 'V6It2ohfRXy8UpjovP6Tnv1XhhNoTYLH' as Core.Entity.Id,
    first_name: 'Web' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'Admin' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'Builder of dreams and software.',
    archived_at: null
  }
  return WebAdmin
}

export const getAnthonyFromFireAuthUserModel = async () => {
  const AnthonyFromFireAuth: UserModel = {
    entity_id: 'vHoY4n1ydupqilsJxSSqFTyQr11I4qRS' as Core.Entity.Id,
    identity_provider: 'fireauth',
    email_address: 'anthonyfireauth@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'anthonyfireauth' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: true,
    verified_since: '2024-12-01 11:23:21',
    suspended_until: null,
    creation_context: 'external',
    password_hash: null,
    role: 'user',
    status: 'active',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return AnthonyFromFireAuth
}

export const getAnthonyFromFireAuthProfileModel = async () => {
  const AnthonyFromFireAuth: ProfileModel = {
    entity_id: 'vHoY4n1ydupqilsJxSSqFTyQr11I4qRS' as Core.Entity.Id,
    first_name: 'Anothony' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'FireAuth' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'I am created through Fireauth',
    archived_at: null
  }
  return AnthonyFromFireAuth
}

export const getLucyFromGoogleUserModel = async () => {
  const AnthonyFromFireAuth: UserModel = {
    entity_id: 'RwWAZdxzxUHdbXfThBHYVWG2vLQubu7Z' as Core.Entity.Id,
    identity_provider: 'google',
    email_address: 'lucygoogle@example.com' as IdentityAuthority.Users.Fields.UniqueEmailAddress,
    username: 'lucygoogle' as IdentityAuthority.Users.Fields.UniqueUsername,
    is_email_verified: true,
    verified_since: '2024-12-01 11:23:21',
    suspended_until: null,
    creation_context: 'external',
    password_hash: null,
    role: 'user',
    status: 'active',
    type: 'concrete',
    otp_secret: createOtpSecret(),
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    archived_at: null
  }
  return AnthonyFromFireAuth
}

export const getLucyFromGoogleProfileModel = async () => {
  const AnthonyFromFireAuth: ProfileModel = {
    entity_id: 'RwWAZdxzxUHdbXfThBHYVWG2vLQubu7Z' as Core.Entity.Id,
    first_name: 'Lucy' as IdentityAuthority.Profile.Fields.FirstName,
    last_name: 'Google' as IdentityAuthority.Profile.Fields.LastName,
    profile_photo: null,
    cover_photo: null,
    created_at: '2024-12-01 11:23:21',
    updated_at: '2024-12-01 11:23:21',
    about: 'I am created through Google',
    archived_at: null
  }
  return AnthonyFromFireAuth
}