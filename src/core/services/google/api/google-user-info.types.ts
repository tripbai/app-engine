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