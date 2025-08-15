import { injectable } from "inversify";
import { AbstractAWSCredentials } from "./aws-credentials.interface";
import { getEnv } from "../../application/appEnv";

@injectable()
export class AWSEnvCredentials implements AbstractAWSCredentials {
  getRegion(): string {
    return getEnv("AWS_REGION");
  }

  getAccessKeyId(): string {
    return getEnv("AWS_ACCESS_KEY_ID");
  }

  getSecretAccessKey(): string {
    return getEnv("AWS_SECRET_KEY");
  }

  getS3BucketName(): string {
    return getEnv("AWS_S3_BUCKET_NAME");
  }
}
