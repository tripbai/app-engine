import { Container } from "inversify"

export namespace Application {

  let _b: Date | null
  export const boot = () => {
    _b = new Date()
  }


  /** Path to the application root */
  let _r: string | null = null

  /**
   * Sets or retrieves the path to Application root directory
   * @param path - to initialize application root path 
   * @returns 
   */
  export const root = (path?: string|undefined) => {
    if (path && _r === null) (_r = path)
    return _r
  }

  /** Type of enviroment */
  let _e: 'test' | 'staging' | 'production' | 'development' | null = null
  export const environment = (name: typeof _e = null)=>{
    if (name !== null && _e === null) _e = name
    return _e ?? 'test'
  }
  
  let _c = new Container()
  export const container = () => {
    return _c
  }


}