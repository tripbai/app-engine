export namespace TimeStamp {

  /** All timestamps in this application must adhere to this format */
  const validRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

  /** Returns the current timestamp in UTC */
  export const now = () => {
    const current = Date.now()
    return normalize(new Date(current))
  }

  export const isValid = (date: string) => {
    if (!validRegex.test(date)) {
      return false
    }
    const dateobj = new Date(date)
    return !isNaN(dateobj.getTime()) && dateobj.toISOString() === date
  }

  const pad = (n: number) => n.toString().padStart(2, '0')

  export const normalize = (date: Date) => {
    const YYYY = date.getUTCFullYear()
    const MM = pad(date.getUTCMonth() + 1)
    const DD = pad(date.getUTCDate())
    const hh = pad(date.getUTCHours())
    const mi = pad(date.getUTCMinutes())
    const ss = pad(date.getUTCSeconds())
    return `${YYYY}-${MM}-${DD} ${hh}:${mi}:${ss}`
  }

}