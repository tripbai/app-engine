import { SNSClient } from "@aws-sdk/client-sns"
import { AppENV } from "../../../helpers/env"

export namespace AmazonSNSHelper {

  type NotificationServiceConfig = {
    ACCESS_KEY: string,
    SECRET_KEY: string,
    REGION: string,
    TOPICS_ARN: {[key:string]:string}
  }

  export namespace Consumer {
    export namespace Https {
      /** This is the payload that AWS SNS sends to your HTTPs endpoint */
      export type ConsumerMessagePayload = {
        Type: 'SubscriptionConfirmation' | 'Notification'
        MessageId: string,
        Message: string,
        TopicArn: string,
        Timestamp: string,
        SignatureVersion: string,
        Signature: string,
        SigningCertURL: string
        // Valid for SubscriptionConfirmation
        Token?: string | undefined,
        SubscribeURL?: string | undefined
        // Valid for Notification
        Subject?: string | undefined,
        UnsubscribeURL?: string | undefined,
        MessageAttributes?: {[key:string]:string} | undefined
      }
    }
  }

  export namespace Client {
    export const Create = (): SNSClient => {
      const options = {
        region: AppENV.get('AWS_REGION'),
        credentials: {
          accessKeyId: AppENV.get('AWS_ACCESS_KEY'),
          secretAccessKey: AppENV.get('AWS_SECRET_KEY'),
        },
      }
      return new SNSClient(options)
    }    
  }

  export namespace Topics {
    /** 
       * With the dynamic pulling of environment variables, 
       * it is now required that the AWS Topics ARN be added 
       * to the .env file.
       */
    export const GetARN = (topic: string): string => {
      const arn = AppENV.get(topic)
      return arn
    }

}

}