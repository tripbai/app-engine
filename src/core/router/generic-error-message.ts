import { injectable } from "inversify";

@injectable()
export class GenericErrorMessage {
  constructor() {}

  getByCode(code: number) {
    let message =
      "This exception was thrown due to an issue encountered within your application";
    switch (code) {
      case 400:
        message = `We are unable to process your request due to missing information `;
        message += `or invalid syntax in the request. Please refer to your provider's `;
        message += `documentation for more information.`;
        break;
      case 404:
        message = `Request failed to complete due to required set of data that `;
        message += `is not found. Please refer to your provider's documentation `;
        message += `for more information. `;
        break;
      case 403:
        message = `You do not have the neccessary permissions to access this resource. `;
        message += `Please refer to  your provider's documentation for more information.`;
        break;
      case 401:
        message = `Your credentials are not valid to be able to proceed with the request. `;
        message += `Please refer to your provider's documentation for more information.`;
        break;
      case 409:
        message = `The record you are trying to create already exists in the system. `;
        message += `Please check your input or try updating the existing record. `;
        message += `Please refer to  your provider's documentation for more information.`;
        break;
      case 10000:
        message =
          "The request could not be completed due to an error response from the external API endpoint";
        break;
      case 10001:
        message = `This exception was thrown due to an issue encountered by one of your `;
        message += `service providers. Please refer to your application logs for more information.`;
        break;
      default:
        break;
    }
    return message;
  }
}
