import { inject, injectable } from "inversify";
import { EventListenerInterface } from "../../../core/providers/event/event-manager.provider";
import { TenantTeamAccessEvent } from "../tenant.events";
import { UserModel } from "../../users/user.model";
import { TenantModel } from "../tenant.model";
import {
  AbstractIndexerProvider,
  IndexTaskItem,
} from "../../../core/providers/indexer/indexer.provider";
import { getEnv } from "../../../core/application/appEnv";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";

/**
 * Listens to `TenantTeamAccessEvent` and updates the index for user access
 */
@injectable()
export class TenantTeamAccessIndexer
  implements EventListenerInterface<TenantTeamAccessEvent>
{
  constructor(
    @inject(AbstractIndexerProvider)
    private readonly indexerProvider: AbstractIndexerProvider
  ) {}

  async execute(
    action: "add:user" | "remove:user",
    userModel: UserModel,
    tenantModel: TenantModel
  ) {
    const indexerNamespaceId = getEnv("IAUTH_INDEXER_NAMESPACE_ID");
    assertValidEntityId(indexerNamespaceId);

    /**
     * This task is used to index the list of users that can access a tenant.
     */
    const taskToAddUserToIndexTenantUsers: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Index:Add:Entity",
      entity_collection: "tenants",
      entity_id: tenantModel.entity_id,
      index_name: "users",
      subject_id: userModel.entity_id,
    };

    /**
     * This task is used to remove a user from the index of users
     */
    const taskToRemoveUserFromIndexTenantUsers: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Index:Remove:Entity",
      entity_collection: "tenants",
      entity_id: tenantModel.entity_id,
      index_name: "users",
      subject_id: userModel.entity_id,
    };

    /**
     * This task is used to index the list of tenants a user can access.
     */
    const taskToAddTenantToIndexOfUserCanAccess: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Index:Add:Entity",
      entity_collection: "users",
      entity_id: userModel.entity_id,
      index_name: "tenants",
      subject_id: tenantModel.entity_id,
    };

    /**
     * This task is used to remove a tenant from the index of tenants
     */
    const taskToRemoveTenantFromIndexOfUserCanAccess: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Index:Remove:Entity",
      entity_collection: "users",
      entity_id: userModel.entity_id,
      index_name: "tenants",
      subject_id: tenantModel.entity_id,
    };

    /**
     * If the action is to add a user, we will index the user access
     * to the tenant.
     */
    if (action === "add:user") {
      await this.indexerProvider.index([
        taskToAddUserToIndexTenantUsers,
        taskToAddTenantToIndexOfUserCanAccess,
      ]);
    } else {
      /**
       * If the action is to remove a user, we will remove the user access
       * to the tenant.
       */
      await this.indexerProvider.index([
        taskToRemoveUserFromIndexTenantUsers,
        taskToRemoveTenantFromIndexOfUserCanAccess,
      ]);
    }
  }
}
