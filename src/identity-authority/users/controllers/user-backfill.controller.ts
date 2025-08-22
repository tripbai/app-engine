import { inject, injectable } from "inversify";
import { BackfillUserSnippetCommand } from "../commands/backfill-user-snippet.command";
import { post } from "../../../core/router/route-decorators";
import * as IdentityAuthority from "../../module/types";
import * as Core from "../../../core/module/types";
import { assertValidEntityId } from "../../../core/utilities/entityToolkit";
import { BadRequestException } from "../../../core/exceptions/exceptions";

@injectable()
export class UserBackfillController {
  constructor(
    @inject(BackfillUserSnippetCommand)
    private backfillUserSnippetCommand: BackfillUserSnippetCommand
  ) {}

  @post<IdentityAuthority.Users.Endpoints.BackfillUserSnippet>(
    "/identity-authority/backfills/user-snippet"
  )
  async backfillUserSnippet<
    T extends IdentityAuthority.Users.Endpoints.BackfillUserSnippet
  >(params: Core.Route.ControllerDTO<T>): Promise<T["response"]> {
    let userId: Core.Entity.Id | null = null;
    try {
      assertValidEntityId(params.data.user_id);
      userId = params.data.user_id;
    } catch (error) {
      throw new BadRequestException({
        message: "Invalid user ID",
        data: { error: error },
      });
    }
    await this.backfillUserSnippetCommand.execute(userId, params.requester);
    return {};
  }
}
