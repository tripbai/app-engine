import { Core } from "../../core/module/module"

/**
 * IdentityAuthority is an application designed to manage user identities, authentication, 
 * and authorization within your application. The primary focus of this application is to 
 * streamline the handling of users, generate product authentication tokens, and manage 
 * roles and permissions effectively. Currently, IdentityAuthority supports popular 
 * identity providers such as Google and Firebase Authentication, providing seamless 
 * integration with external authentication systems.
 */
export namespace IdentityAuthority {
  export namespace Providers {
    export type Identity = 'fireauth' | 'google' | 'iauth'
    export type Pick<T extends Identity> = T
    export type Disregard<T extends Identity> = Exclude<Identity, T>
  }
  export namespace Users {
    export type Type = 'concrete' | 'abstract'
    export type Collection = 'users'
    export namespace Status {
      export type Type = 'active' | 'unverified' | 'banned' | 'deactivated' | 'archived' | 'suspended'
      export type Pick<T extends Type> = T
      export type Disregard<T extends Type> = Exclude<Type, T>
    }
    export namespace ApplicationAccess {
      /** User status that are allowed to communicate with your application */
      export type Allowed = Status.Pick<'active' | 'unverified'>
      /** User status that are allowed, but LIMITED to communicate with your application */
      export type Limited = Status.Pick<'deactivated' | 'archived'>
      /** User status that are PROHIBITED to communicate with your application */
      export type Prohibited = Status.Pick<'banned' | 'suspended'>
      export type Report = {
        is_user_registered: true,
        user_status: Allowed,
        token: string
        user_id: string
        access_type: 'allowed'
      } | {
        is_user_registered: true,
        user_status: Limited,
        token: string
        user_id: string
        access_type: 'limited'
      } | {
        is_user_registered: true,
        user_id: string
        user_status: Prohibited
        access_type: 'prohibited'
      } | {
        is_user_registered: false
      }
    }
    export namespace Fields {
      /** A valid email address, but may not be unique */
      export type EmailAddress = string & {minLen:8,maxLen:64,verifiedUnique:false,key:'email_address'}
      /** A valid email address, and certified unique throughout the application */
      export type UniqueEmailAddress = string & {minLen:8,maxLen:64,verifiedUnique:true,key:'email_address'}
      /** A valid username, but may not be unique */
      export type Username = string & {minLen:5,maxLen:32,verifiedUnique:false,key:'username'}
      /** A valid username, and certified unique throughout the application */
      export type UniqueUsername = string & {minLen:5,maxLen:32,verifiedUnique:true,key:'username'}
      export type RawPassword = string & {minLen:8,maxLen:64,key:'raw_password'}
      export type HashedPassword = string & {minLen:8,maxLen:64,key:'hashed_password'}
    }
    export type Snippet = {
      id: Core.Entity.Id,
      first_name: Profile.Fields.FirstName,
      last_name: Profile.Fields.LastName,
      username: Fields.Username,
      email_address: Fields.EmailAddress,
      is_email_verified: boolean
      user_type: Type
      status: Status.Type,
      profile_photo: Profile.Fields.Image | null,
      cover_photo: Profile.Fields.Image | null
    }
    export namespace Endpoints {
      export type Create = {
        request: {
          path: '/identity-authority/users',
          method: 'POST',
          data: {
            type: 'concrete'
            context: 'external'
            provider: 'iauth'
            role: 'user'
            first_name: Profile.Fields.FirstName
            last_name: Profile.Fields.LastName
            username: Fields.Username
            email_address: Fields.EmailAddress
            password: Fields.RawPassword
          }
        },
        response: {
          type: 'concrete'
          context: 'external'
          provider: 'iauth'
          role: 'user'
          user_id: Core.Entity.Id,
          first_name: Profile.Fields.FirstName
          last_name: Profile.Fields.LastName
          username: Fields.UniqueUsername,
          email_address: Fields.UniqueEmailAddress,
          status: Status.Pick<'unverified'>,
          iauth_token: string
        }
      }
      export type AccessReport = {
        request: {
          method: 'POST',
          path: '/identity-authority/access-report',
          data: {
            provider: 'iauth'
            email_address: Users.Fields.EmailAddress
            password: Users.Fields.RawPassword
          }
        }
        response: ApplicationAccess.Report
      }
      export type GetSelf = {
        request: {
          method: 'GET'
          path: 'identity-authority/user/me'
        }
        response: {
          entity_id: Core.Entity.Id
          first_name: Profile.Fields.FirstName
          last_name: Profile.Fields.LastName
          profile_photo: Profile.Fields.Image | null
          cover_photo: Profile.Fields.Image | null
          about: string | null
          username: Fields.UniqueUsername
          email_address: Fields.UniqueEmailAddress
          is_email_verified: boolean
          user_type: Users.Type
          status: Status.Type
          verified_since: string | null
          role: 'webadmin' | 'user' | 'moderator'
        }
      }
      export type GetModel = {
        request: {
          method: 'GET'
          path: 'identity-authority/users/:user_id'
        }
        response: {
          identity_provider: IdentityAuthority.Providers.Identity
          email_address: IdentityAuthority.Users.Fields.UniqueEmailAddress 
          username: IdentityAuthority.Users.Fields.UniqueUsername 
          is_email_verified: boolean
          verified_since: string | null
          suspended_until: string | null
          creation_context: 'external' | 'internal'
          role: 'webadmin' | 'user' | 'moderator'
          status: IdentityAuthority.Users.Status.Type
          type: IdentityAuthority.Users.Type
        }
      }
    }
  }
  export namespace Profile {
    export namespace Fields {
      /** The type of User first name */
      export type FirstName = string & {minLen:2,maxLen:32,key:'first_name'}
      /** The type of User last name */
      export type LastName  = string & {minLen:2,maxLen:32,key:'last_name'}
      export type Image = string & {type: 'profile_image_rel_path'}
    }
  }
}