export abstract class AbstractAWSCredentials {

  abstract getRegion(): string

  abstract getAccessKeyId(): string

  abstract getSecretAccessKey(): string

  abstract getS3BucketName(): string

}