import { inject, injectable } from "inversify";
import { PublishCommandInput } from "@aws-sdk/client-sns";
import { AmazonSNSService } from "../../../services/aws/sns/awsns.service";
import { AbstractTopicPublisherProvider } from "../topic-publisher.provider";

@injectable()
export class AmazonSNSTopicPublisherService
  implements AbstractTopicPublisherProvider
{
  constructor(
    @inject(AmazonSNSService) public readonly AmazonSNSService: AmazonSNSService
  ) {}

  async publishTopic(
    topicArn: string,
    message: string,
    options?:
      | {
          subject?: string | undefined;
          messageAttributes?:
            | { [key: string]: { DataType: "String"; StringValue: string } }
            | undefined;
          messageGroupId?: string | undefined;
          messageDeduplicationId?: string | undefined;
        }
      | undefined
  ): Promise<void> {
    const params: PublishCommandInput = {
      TopicArn: topicArn as string,
      Message: message,
    };

    if (options !== undefined) {
      params.Subject = options.subject;
      params.MessageAttributes = options.messageAttributes;
    }

    if (topicArn.endsWith(".fifo")) {
      if (
        options === undefined ||
        options.messageGroupId === undefined ||
        typeof options.messageGroupId !== "string"
      ) {
        throw new Error("messageGroupId is required for FIFO topics");
      }
      params.MessageGroupId = options.messageGroupId;
      params.MessageDeduplicationId =
        options.messageDeduplicationId || Date.now().toString();
      return this.AmazonSNSService.publishAsFifo(
        params.TopicArn,
        params.Message,
        params.MessageGroupId,
        params.MessageDeduplicationId,
        params.MessageAttributes
      );
    }

    return this.AmazonSNSService.publish(
      params.TopicArn,
      params.Message,
      params.MessageAttributes
    );
  }
}
