import { inject, injectable } from "inversify";
import { GetUserAccessLibraryQuery } from "../queries/get-user-access-library.query";
import { del, patch, post, put, get } from "../../../core/router/decorators";
import { TripBai } from "../../module/module.interface";
import { Core } from "../../../core/module/module";
import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

@injectable()
export class UserAccessLibraryGetController {

  constructor(
    @inject(GetUserAccessLibraryQuery) public readonly getUserAccessLibraryQuery: GetUserAccessLibraryQuery
  ) {}

  @get<TripBai.Access-library.Endpoints.GetUserAccessLibrary>('/tripbai/access-library/users/:user_id')
  async getUserAccessLibrary<T extends TripBai.Access-library.Endpoints.GetUserAccessLibrary>(
    params: Core.Route.ControllerDTO<T>
  ): Promise<T['response']> {
    const commandDTO: Parameters<GetUserAccessLibraryQuery["execute"]>[0] = Object.create(null)
    commandDTO.requester = params.requester
    try {
    
    } catch (error) {
      throw new BadRequestException({
        message: 'request failed due to invalid params',
        data: { error }
      })
    }
    throw new LogicException({
      message: 'This controller is not implemented yet',
      data: {
        controller_name: 'UserAccessLibraryGetController'
      }
    })
  }

}