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
    /**
     * A lightweight representation of a user
     */
    export type Snippet = {
      id: Core.Entity.Id
      first_name: Profile.Fields.FirstName
      last_name: Profile.Fields.LastName
      username: Fields.UniqueUsername
      email_address: Fields.UniqueEmailAddress
      is_email_verified: boolean
      user_type: Type
      status: Status.Type,
      profile_photo: Profile.Fields.Image | null
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
            status: Status.Pick<'unverified'>
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
          path: '/identity-authority/user/me'
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
          path: '/identity-authority/users/:user_id'
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
      export type GetByEmailOrUsername = {
        request: {
          path: '/identity-authority/user/get/snippet?type=:type&value=:value',
          method: 'GET'
        }
        response: Snippet
      }
      export type UpdateUser = {
        request: {
          method: 'PATCH',
          path: '/identity-authority/users/:user_id',
          data: {
            identity_provider?: Providers.Identity
            first_name?: Profile.Fields.FirstName
            last_name?: Profile.Fields.LastName
            about?: string
            profile_photo?: {
              upload_token: string
            }
            cover_photo?: {
              upload_token: string
            }
            password?: {
              reset_confirmation_token?: string
              current_password?: Fields.RawPassword
              new_password: Fields.RawPassword
            }
            username?: Fields.Username 
            email_address?: {
              update_confirmation_token: string
            }
            is_email_verified?: {
              verification_confirmation_token: string
            }
            type?: Type
          }
        }
        response: {}
      }
      export type UpdateUserStatus = {
        request: {
          method: 'POST',
          path: '/identity-authority/user/moderate/status',
          data: {
            user_id: Core.Entity.Id
            status: IdentityAuthority.Users.Status.Disregard<'suspended'>
          } | {
            user_id: Core.Entity.Id
            status: IdentityAuthority.Users.Status.Pick<'suspended'>
            suspend_until: string
          }
        }
        response: {}
      }
      export type UpdateUserRole = {
        request: {
          method: 'POST'
          path: '/identity-authority/user/delegate/role'
          data: {
            user_id: Core.Entity.Id
            role: 'webadmin' | 'moderator' | 'user'
          }
        }
        response: {}
      }
      export type SendEmailForAccountVerification = {
        request: {
          method: 'POST',
          path: '/identity-authority/user/send-account-verification-email'
        }
        response: {}
      }
      export type SendEmailForPasswordReset = {
        request: {
          method: 'POST',
          path: '/identity-authority/user/send-password-reset-email',
          data: {
            email_address: Fields.EmailAddress
          }
        }
        response: {}
      }
      export type SendEmailForNewEmailConfirmation = {
        request: {
          method: 'POST',
          path: '/identity-authority/user/send-new-email-confirmation',
          data: {
            email_address: Fields.EmailAddress
          }
        }
        response: {}
      }
      export type MFAValidateOTP = {
        request: {
          path: '/identity-authority/users/mfa/otp/validate',
          method: 'POST',
          data: {
            user_id: Core.Entity.Id
            otp: string
          }
        },
        response: ApplicationAccess.Report
      }
      export type UploadImage = {
        request: {
          path: '/identity-authority/users/:user_id/images/upload',
          method: 'POST',
          data: {
            file: File,
            type: 'profile_photo' | 'cover_photo'
          }
        }
        response: {
          relative_path: Core.File.UploadPath
          upload_token: string
        }
      }
      export type RefreshAccessToken = {
        request: {
          path: '/identity-authority/tokens/refresh',
          method: 'POST'
        },
        response: {
          token: string
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
      export type Image = Core.File.UploadPath
    }
  }
  export namespace Images {
    export type SupportedExtensions = 'jpeg' | 'jpg' | 'webp' | 'png'
    export namespace Endpoints {
      export type Upload = {
        request: {
          path: '/identity-authority/images/upload'
          method: 'POST',
          data: {
            audience: string
            file: File
            uploadedForEntityId: string
          }
        }
        response: {
          relativePath: Core.File.UploadPath
          image_token: string
        }
      }
    }
  }
  export namespace EmailTemplatesRegistry {
    export namespace Fields {
      export type EmailType 
        = 'password_reset_template' |
          'account_verification_template' | 
          'email_confirmation_template' | 
          'login_link_template'
    }
    export namespace Endpoints {
      export type Create = {
        request: {
          path: '/identity-authority/registry/email-templates'
          method: 'POST'
          data: {
            template_type: Fields.EmailType
            template_id: Core.Entity.Id
            description?: string
          }
        }
        response: {
          entity_id: Core.Entity.Id
          template_type: Fields.EmailType
          template_id: Core.Entity.Id
          description: string | null
        }
      }
      export type GetAll = {
        request: {
          path: '/identity-authority/registry/email-templates'
          method: 'GET'
        }
        response: Array<{
          entity_id: Core.Entity.Id
          template_type: Fields.EmailType
          template_id: Core.Entity.Id
          description: string | null
          created_at: string
          updated_at: string
        }>
      }
      export type Update = {
        request: {
          path: '/identity-authority/registry/email-templates/:entity_id'
          method: 'PATCH'
          data: {
            description: string
            template_id: Core.Entity.Id
          }
        }
        response: {}
      }
    }
  }
  export namespace Tenants {
    export namespace CertificationTokenData {
      export type Issuer = 'identity-authority:tenant-access-certifier'
      export type Data = {
        tenant_id: Core.Entity.Id
        user_id: Core.Entity.Id
        is_owner: boolean
        tenant_permissions: Array<Core.Authorization.ConcreteToken>
      }
    }
    export namespace Endpoints {
      export type CreateTenant = {
        request: {
          path: '/identity-authority/tenants',
          method: 'POST',
          data: {
            name: string
          }
        }
        response: {
          entity_id: Core.Entity.Id
          secret_key?: string
          name: string
          profile_photo: string | null
          cover_photo: string | null
          created_at: string
          updated_at: string
        }
      }
      export type GetTenant = {
        request: {
          path: '/identity-authority/tenants/:tenant_id',
          method: 'GET',
          data: {}
        }
        response: {
          entity_id: Core.Entity.Id
          name: string
          profile_photo: string | null
          cover_photo: string | null
        }
      }
      export type CertifyAccess = {
        request: {
          path: '/identity-authority/tenants/:tenant_id/certify-access'
          method: 'POST'
          data: {
            audience: string
          }
        }
        response: {
          access_certification_token: string
        }
      }
      /** @TODO */
      export type CertifyUser = {
        request: {
          path: '/identity-authority/tenants/:tenant_id/certify-user'
          method: 'POST',
          data: {
            user_id: string
          }
        }
        response: {
          team_entity_id: string
        }
      }
      export type UpdateTenant = {
        request: {
          path: '/identity-authority/tenants/:tenant_id',
          method: 'PATCH',
          data: {
            name?: string
            profile_photo?: {
              upload_token: string
            }
            cover_photo?: {
              upload_token: string
            }
          }
        }
        response: {}
      }
      export type UploadImage = {
        request: {
          path: '/identity-authority/tenants/:tenant_id/images/upload',
          method: 'POST',
          data: {
            file: File,
            type: 'profile_photo' | 'cover_photo'
          }
        }
        response: {
          relative_path: Core.File.UploadPath
          upload_token: string
        }
      }
      export type AddUserToTeam = {
        request: {
          path: '/identity-authority/tenants/:tenant_id/team/users'
          method: 'POST',
          data: {
            user_id: Core.Entity.Id
          }
        }
        response: {}
      }
      export type RemoveUserFromTeam = {
        request: {
          path: '/identity-authority/tenants/:tenant_id/team/users/:user_id'
          method: 'DELETE',
          data: {}
        }
        response: {}
      }
    }
  }
}