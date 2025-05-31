import { Container } from "inversify"
import { ProxyRouter } from "./router/proxy-router"

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

  const _x: Array<{
    path: string,
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    Controller: string
    handler: string
  }> = []
  export const route = (config: typeof _x[0] | null = null): typeof _x => {
    if (config === null) return _x
    _x.push(config)
    return _x
  }


}