/**
 * An interface for a notification provider, defining methods for publishing messages.
 * 
 * @interface NotificationProviderInterface
 */
export interface NotificationProviderInterface {
  /**
   * Publishes a message to a specified topic.
   * 
   * @param {string} topic - The topic to which the message will be published.
   * @param {{[key: string]: any}} message - The message data to publish, represented as an object with key-value pairs.
   * @returns {Promise<void>} A promise that resolves when the message is successfully published.
   */
  publish(topic: string, message: { [key: string]: any }): Promise<void>

  /**
   * Publishes a message to a FIFO topic, requiring unique identifiers for deduplication.
   * 
   * @param {string} topic - The FIFO topic to which the message will be published.
   * @param {string} MessageGroupId - The identifier used to group related messages.
   * @param {string} DeduplicationId - A unique identifier for deduplication purposes.
   * @param {string} message - The message content to publish.
   * @returns {Promise<void>} A promise that resolves when the message is successfully published to the FIFO topic.
   */
  publishAsFifo(topic: string, MessageGroupId: string, DeduplicationId: string, message: string): Promise<void>
  
}
