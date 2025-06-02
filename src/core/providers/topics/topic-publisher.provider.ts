/**
 * An interface for a Topic Publisher provider, defining methods for publishing messages.
 */
export abstract class AbstractTopicPublisherProvider {
  /**
   * Publishes a message to a specified topic.
   * 
   * @param {string} topicId - The topic Id to which the message will be published.
   * @param {{[key: string]: any}} message - The message data to publish, represented as an object with key-value pairs.
   * @returns {Promise<void>} A promise that resolves when the message is successfully published.
   */
  abstract publishTopic(
    topicId: string, 
    message: string,
    options?: {
      /** Optional subject (for standard topics) */
      subject?: string | undefined 
      /** Optional metadata */         
      messageAttributes?: {[key:string]:{DataType: 'String', StringValue: string}} | undefined
      /** Required for FIFO topics */
      messageGroupId?: string | undefined 
      /** Optional for FIFO topics */
      messageDeduplicationId?: string | undefined 
    }
  ): Promise<void>

  
}
