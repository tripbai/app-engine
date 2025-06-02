import { injectable } from "inversify";
import { AbstractAWSCredentials } from "./aws-credentials.interface";
import { AppENV } from "../../helpers/env";

@injectable()
export class AWSEnvCredentials implements AbstractAWSCredentials {

  getRegion(): string {
      return AppENV.get('AWS_REGION')
  }

  getAccessKeyId(): string {
    return AppENV.get('AWS_ACCESS_KEY_ID')
  }

  getSecretAccessKey(): string {
    return AppENV.get('AWS_SECRET_KEY')
  }

}