import axios from "axios";
import { handleAxiosError } from "../../axios/error.handler";
import { ExternalApiException } from "../../../exceptions/exceptions";

/**
 * Represents information about a Google user retrieved from the Google API.
 * 
 * @typedef {Object} GoogleUserInfo
 * @property {string} id - The unique identifier for the Google user.
 * @property {string} email - The email address of the Google user.
 * @property {boolean} verified_email - Indicates if the email address has been verified by Google.
 * @property {string} name - The full name of the Google user.
 * @property {string} given_name - The given name (first name) of the Google user.
 * @property {string} family_name - The family name (last name) of the Google user.
 * @property {string} picture - The URL to the Google user’s profile picture.
 * @property {string} locale - The locale setting of the Google user.
 */
export type GoogleUserInfo = {
  id: string,
  email:string,
  verified_email: boolean,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}

/**
 * A class to retrieve Google user information via the Google API.
 */
export class GoogleAPIUserInfo {

  /**
   * Retrieves Google user information using an OAuth provider token.
   * @param providerToken - The OAuth access token to authorize the API request.
   * @returns A promise that resolves with `GoogleUserInfo` or rejects with an error if the request fails.
   */
  static v1(providerToken: string):Promise<GoogleUserInfo>{
    return new Promise(async (resolve,reject)=>{
      try {
        const apiResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+providerToken)
        const apiData:GoogleUserInfo = apiResponse.data
        resolve(apiData)
      } catch (error) {
        const infos = handleAxiosError(error)
        reject(new ExternalApiException({
          message: 'v1 retrieve google info failed',
          statusCode: infos.code,
          data: {error: error}
        }))
      }
    })
  }
}