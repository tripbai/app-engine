import { BaseEntity } from "../../core/orm/entity/base-entity";
import { boolean, nullable, timestamp, varchar } from "../../core/orm/entity/decorators";
import { IdentityAuthority } from "../module/module.interface";
import { UserValidator } from "./user.validator";

export class UserModel extends BaseEntity<UserModel> {

  @varchar(UserValidator.identity_provider)
  identity_provider: IdentityAuthority.Providers.Identity

  @varchar(UserValidator.email_address) 
  email_address: IdentityAuthority.Users.Fields.UniqueEmailAddress 

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

  @varchar(UserValidator.creation_context)
  creation_context: 'external' | 'internal'

  @varchar(UserValidator.role)
  role: 'webadmin' | 'user' | 'moderator'

  @nullable()
  @varchar() 
  password_hash: IdentityAuthority.Users.Fields.HashedPassword | null

  @varchar(UserValidator.status) 
  status: IdentityAuthority.Users.Status.Type

  @varchar(UserValidator.type)
  type: IdentityAuthority.Users.Type
  
  @varchar()
  otp_secret: string
  
}