import { inject, injectable } from "inversify";
import { AxiosService } from "../../axios/axios.service";
import { GoogleUserInfo } from "./google-user-info.types";
import { ExternalApiException } from "../../../exceptions/exceptions";
import { handleAxiosError } from "../../../utilities/handleAxiosError";

/**
 * A Service class that retrieves Google user information via the Google API.
 */
@injectable()
export class GoogleUserInfoService {
  constructor(@inject(AxiosService) private AxiosService: AxiosService) {}

  /**
   * Retrieves Google user information using an OAuth provider token.
   * @param providerToken - The OAuth access token to authorize the API request.
   * @returns A promise that resolves with `GoogleUserInfo` or rejects with an error if the request fails.
   */
  async v1(providerToken: string): Promise<GoogleUserInfo> {
    try {
      const apiResponse = await this.AxiosService.get(
        "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
          providerToken
      );
      const apiData: GoogleUserInfo = apiResponse.data;
      return apiData;
    } catch (error) {
      const infos = handleAxiosError(error);
      throw new ExternalApiException({
        message: "v1 retrieve google info failed",
        statusCode: infos.code,
        data: { error: error },
      });
    }
  }
}
