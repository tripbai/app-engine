import { BaseEntity } from "../../core/orm/entity/base-entity";
import { boolean, collection, length, nullable, timestamp, unique, varchar } from "../../core/orm/entity/decorators";
import { IdentityAuthority } from "../module/module.interface";
import { UserValidator } from "./user.validator";

@collection('users')
export class UserModel extends BaseEntity<UserModel> {

  @length(12)
  @varchar(UserValidator.identity_provider)
  identity_provider: IdentityAuthority.Providers.Identity

  @length(64)
  @unique()
  @varchar(UserValidator.email_address) 
  email_address: IdentityAuthority.Users.Fields.UniqueEmailAddress 

  @length(32)
  @unique()
  @varchar(UserValidator.username)
  username: IdentityAuthority.Users.Fields.UniqueUsername 

  @boolean()
  is_email_verified: boolean

  @nullable()
  @timestamp()
  verified_since: string | null

  @nullable()
  @timestamp()
  suspended_until: string | null

  @length(12)
  @varchar(UserValidator.creation_context)
  creation_context: 'external' | 'internal'

  @length(12)
  @varchar(UserValidator.role)
  role: 'webadmin' | 'user' | 'moderator'

  @length(512)
  @nullable()
  @varchar() 
  password_hash: IdentityAuthority.Users.Fields.HashedPassword | null

  @length(12)
  @varchar(UserValidator.status) 
  status: IdentityAuthority.Users.Status.Type

  @length(12)
  @varchar(UserValidator.type)
  type: IdentityAuthority.Users.Type
  
  @length(64)
  @varchar()
  otp_secret: string
  
}