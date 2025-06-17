import { inject, injectable } from "inversify";
import { EventListenerInterface } from "../../../core/providers/event/event-manager.provider";
import { UserCreateEvent, UserUpdateEvent } from "../user.events";
import { UserModel } from "../user.model";
import { ProfileModel } from "../../profiles/profile.model";
import { AbstractIndexerProvider, IndexTaskItem } from "../../../core/providers/indexer/indexer.provider";
import { IdentityAuthority } from "../../module/module.interface";
import { AppENV } from "../../../core/helpers/env";
import { EntityToolkit } from "../../../core/orm/entity/entity-toolkit";
import { Core } from "../../../core/module/module";

/**
 * UserSnippetIndexer is an event listener that indexes user snippets.
 */
@injectable()
export class UserSnippetIndexer implements EventListenerInterface<UserCreateEvent|UserUpdateEvent> {

  constructor(
    @inject(AbstractIndexerProvider) private readonly indexerProvider: AbstractIndexerProvider
  ){}

  async execute(userModel: UserModel, profileModel: ProfileModel){

    const snippet: IdentityAuthority.Users.Snippet = {
      id: userModel.entity_id,
      first_name: profileModel.first_name,
      last_name: profileModel.last_name,
      email_address: userModel.email_address,
      username: userModel.username,
      profile_photo: profileModel.profile_photo,
      cover_photo: profileModel.cover_photo,
      status: userModel.status,
      is_email_verified: userModel.is_email_verified,
      user_type: userModel.type,
    }

    const indexerNamespaceId = AppENV.get('IAUTH_INDEXER_NAMESPACE_ID')
    EntityToolkit.Assert.idIsValid(indexerNamespaceId)

    const userSnippetTask: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Snippet:Entity",
      entity_collection: "users",
      entity_id: userModel.entity_id,
      entity_snippet: snippet,
    }

    const taskToIndexUserToAllUsers: IndexTaskItem = {
      namespace_id: indexerNamespaceId,
      type: "Index:Add:Entity",
      entity_collection: "index",
      entity_id: 'users' as Core.Entity.Id,
      index_name: "all",
      subject_id: userModel.entity_id
    }

    await this.indexerProvider.index([
      userSnippetTask,
      taskToIndexUserToAllUsers
    ])

  }
}