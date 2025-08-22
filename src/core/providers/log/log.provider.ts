
export abstract class LogProvider {

  abstract error(params: {
    severity: number
    message: string
    data: Record<string, any>
  }): void

  abstract info(message: string): void

}