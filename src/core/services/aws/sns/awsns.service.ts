import { PublishCommand, SNSClient, PublishCommandInput, MessageAttributeValue } from "@aws-sdk/client-sns"
import { inject, injectable } from "inversify";
import { AbstractAWSCredentials } from "../aws-credentials.interface";
import { AWSEnvCredentials } from "../aws-env-credentials";
import { GenericServiceProviderException } from "../../../exceptions/exceptions";

@injectable()
export class AmazonSNSService {

  private static Client: SNSClient | null = null

  constructor(
    @inject(AWSEnvCredentials) public readonly AWSEnvCredentials: AbstractAWSCredentials
  ){

  }

  getClient(){
    if (AmazonSNSService.Client !== null) 
      return AmazonSNSService.Client
    const options = {
      region: this.AWSEnvCredentials.getRegion(),
      credentials: {
        accessKeyId: this.AWSEnvCredentials.getAccessKeyId(),
        secretAccessKey: this.AWSEnvCredentials.getSecretAccessKey(),
      },
    }
    AmazonSNSService.Client = new SNSClient(options)
    return AmazonSNSService.Client
  }

  async publish(
    topicARN: string | undefined,
    message: string | undefined,
    MessageAttributes: Record<string, MessageAttributeValue> | undefined
  ): Promise<void> {
    try {
      const params = { 
        TopicArn: topicARN,
        Message: message,
        MessageAttributes: MessageAttributes
      }
      const command = new PublishCommand(params)
      await this.getClient().send(command)
      return
    } catch (error) {
      throw new GenericServiceProviderException({
        message: 'aws sns publish failed',
        severity: 2,
        data: {error: error}
      })
    }
  }

  async publishAsFifo(
    topicARN: string | undefined, 
    message: string | undefined,
    MessageGroupId: string | undefined, 
    DeduplicationId: string | undefined, 
    MessageAttributes: Record<string, MessageAttributeValue> | undefined
  ): Promise<void> {
    try {
      const params = { 
        TopicArn: topicARN,
        MessageGroupId: MessageGroupId,
        MessageDeduplicationId: DeduplicationId,
        Message: message,
        MessageAttributes: MessageAttributes
      }
      const command = new PublishCommand(params)
      await this.getClient().send(command)
    } catch (error) {
      throw new GenericServiceProviderException({
        message: 'aws sns publish as fifo failed',
        severity: 2,
        data: {error: error}
      })
    }
  }

}