import { NotificationProviderInterface } from "../interface";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { AmazonSNSHelper } from "./awsns.helper";
import { GenericServiceProviderException, LogicException } from "../../../exceptions/exceptions";

let snsClient: SNSClient | null = null

export class AmazonSNSService implements NotificationProviderInterface {
  private client: SNSClient
  private topicARNs: {[key:string]:string}
  constructor() {
    if (snsClient === null) {
      snsClient = AmazonSNSHelper.Client.Create()
    }
    this.client = snsClient
  }

  publish(
    topic: string, 
    message: { [key: string]: any; }
  ): Promise<void> {
    return new Promise (async (resolve,reject)=>{
      try {
        const ARN = AmazonSNSHelper.Topics.GetARN(topic)
        const input = { 
          TopicArn: ARN,
          Message: JSON.stringify(message),
          MessageAttributes: {
            TenantId: {
              DataType: 'String',
              StringValue: 'kryptolib'
            }
          }
        }
        const command = new PublishCommand(input);
        const response = await this.client.send(command)
        resolve()
      } catch (error) {
        reject(new GenericServiceProviderException({
          message: 'aws sns publish failed',
          severity: 2,
          data: {error: error}
        }))
      }
    })
  }

  publishAsFifo(
    topic: string, 
    MessageGroupId: string, 
    DeduplicationId: string, 
    message: string
  ): Promise<void> {
    return new Promise (async (resolve,reject)=>{
      try {
        const ARN = AmazonSNSHelper.Topics.GetARN(topic)
        if (ARN === null) {
          throw new LogicException({
            message: 'arn for SNS topic not found',
            data: {topic: topic}
          })
        }
        const input = { 
          TopicArn: ARN,
          MessageGroupId: MessageGroupId,
          MessageDeduplicationId: DeduplicationId,
          Message: message,
          MessageAttributes: {
            TenantId: {
              DataType: 'String',
              StringValue: 'kryptolib'
            }
          }
        }
        const command = new PublishCommand(input);
        const response = await this.client.send(command)
        resolve()
      } catch (error) {
        reject(new GenericServiceProviderException({
          message: 'aws sns publish as fifo failed',
          severity: 2,
          data: {error: error}
        }))
      }
    })
  }
}