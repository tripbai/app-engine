import { injectable } from "inversify";
import { AppENV } from "../../../helpers/env";
import { AbstractTopicPublisherProvider } from "../topic-publisher.provider";
import axios from "axios"

/**
 * A notification service used for quick integration testing. 
 */
@injectable()
export class Notif8701TopicPublisher implements AbstractTopicPublisherProvider {

  async publishTopic(
    topicId: string, 
    message: string, 
    options?: { 
      subject?: string | undefined; 
      messageAttributes?: { [key: string]: { DataType: "String"; StringValue: string; }; } | undefined; 
      messageGroupId?: string | undefined; 
      messageDeduplicationId?: string | undefined; 
    } | undefined
  ): Promise<void> {
    queue.push({
      topic: topicId,
      message: JSON.stringify(message)
    })
  }

}

const queue: Array<{
  topic: string,
  message: string,
  deduplicationId?: string,
  messageGroupId? :string
}> = []

/**
 * Processes the queue by sending messages to the configured endpoint.
 */
const processQueue = async () => {
  const uri = AppENV.get('NOTIF8071_RECEIVER')
  const item = queue.shift()
  if (item !== undefined) {
    try {
      await axios.post(uri, item)
    } catch (error) {
      console.log(`Failed to send message to ${uri}:`);
      console.log({item})
      console.error(error)
    }
  }
}

// Initialize the queue processing
let started = false
const __init = () => {
  if (started) return
  started = true
  setInterval(processQueue,1000)
}
__init()
