import { Application } from "../application"
import { TimeStamp } from "./timestamp"

export namespace AppLogger {
  export const error = (params: {
    severity: number
    message: string
    data: Record<string,any>
  }) => {
    const timestamp = TimeStamp.now()
    const stack = new Error().stack
    if (Application.environment() !== 'test') {
      console.log(`${timestamp} | ERROR | ${params.message} | ${JSON.stringify(params.data)}`)
    }
    
  }
  export const info = (message: string) => {
    const timestamp = TimeStamp.now()
    if (Application.environment() !== 'test') {
      console.log(`${timestamp} | INFO | ${message}`)
    }
  }
}