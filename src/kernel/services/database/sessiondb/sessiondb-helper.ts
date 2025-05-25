import { DatabaseSingleTransaction } from "../interface";

export namespace SessionDBHelper {

  export namespace Transactions {

    export type Type = 'key.create' | 'key.update'

    export const single = (
      type: Transactions.Type,
      collection: string,
      data: {[key:string]: any}
    ): DatabaseSingleTransaction => {
      return {
        query: type + '//' + collection,
        data: data
      }
    }
  }

  export const clone = (data: {[key:string]:any}) => {
    const cloned: Record<string, any> = Object.create(null)
    for (const key in data) {
      cloned[key] = data[key]
    }
    return cloned
  }
}