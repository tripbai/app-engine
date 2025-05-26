import { AppENV } from "../../../helpers/env";
import { NotificationProviderInterface } from "../interface";
import axios from "axios"

/**
 * A notification service used for quick-testing integration. 
 */
export class Notif8701 implements NotificationProviderInterface {

  uri: string

  constructor() {}

  async publish(
    topic: string, 
    message: { [key: string]: any; }
  ): Promise<void> {
    queue.push({
      topic: topic,
      message: JSON.stringify(message)
    })
    __init()
  }

  async publishAsFifo(
    topic: string, 
    messageGroupId: string, 
    deduplicationId: string, 
    message: string
  ): Promise<void> {
    queue.push({topic, message, messageGroupId, deduplicationId})
    __init()
  }
}

const queue: Array<{
  topic: string,
  message: string,
  deduplicationId?: string,
  messageGroupId? :string
}> = []

let started = false
const __init = () => {
  if (started) return
  started = true
  setInterval(async ()=>{
    const uri  = AppENV.get('NOTIF8071_RECEIVER')
    const item = queue.shift()
    if (item !== undefined) {
      await axios.post(uri, item)
    }
  },1000)
}