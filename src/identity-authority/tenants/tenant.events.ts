import { Core } from "../../core/module/module"
import { EventInterface } from "../../core/providers/event/event-manager.provider"
import { UserModel } from "../users/user.model"
import { TenantModel } from "./tenant.model"

/**
 * `TenantCreateEvent` is dispatched when a user creates a tenant.
 */
export class TenantCreateEvent implements EventInterface {
  id() {return '4d80c7df-040f-49a9-918a-b99bb1a5ad0f'}
  async handler(Tenant: TenantModel){}
}

/**
 * `TenantUpdateEvent` is dispatched when tenant data is updated.
 */
export class TenantUpdateEvent implements EventInterface {
  id() {return '9302cfcc-b48b-41f8-a71d-cb68bfd6b385'}
  async handler(Tenant: TenantModel){}
}

/**
 * `TenantTeamAccessEvent` is dispatched when a user is added or removed
 * from the tenant's teams. Please know that this is also triggered when
 * the user creates a new tenant, the user will eventually be added as
 * member of their own tenant.
 */
export class TenantTeamAccessEvent implements EventInterface {
  id() {return '85cc3c9d-be0a-468d-852e-16e098de23d5'}
  async handler(
    action: 'add:user' | 'remove:user', 
    userModel: UserModel, 
    tenantModel: TenantModel,
  ){}
}