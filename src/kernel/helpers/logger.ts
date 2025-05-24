import { TimeStamp } from "./timestamp"

export namespace AppLogger {
  export const error = (params: {
    severity: number
    message: string
    data: Record<string,any>
  }) => {
    const timestamp = TimeStamp.now()
    const stack = new Error().stack
    console.log(`${timestamp} | ERROR | ${params.message} | ${JSON.stringify(params.data)}`)
  }
  export const info = (message: string) => {
    const timestamp = TimeStamp.now()
    console.log(`${timestamp} | INFO | ${message}`)
  }
}