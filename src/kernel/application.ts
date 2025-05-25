export namespace Application {

  let BootDate: Date | null
  export const boot = () => {
    BootDate = new Date()
  }


  /** Application root directory */
  let ROOT: string | null = null

  /**
   * Retrieves the path to Application root directory
   * @param path - to initialize application root path 
   * @returns 
   */
  export const root = (path?: string|undefined) => {
    if (path && ROOT === null) (ROOT = path)
    return ROOT
  }

  /** == DEPLOYMENTS ==*/
  let DEPLOYMENT: 'test' | 'staging' | 'production' | 'development' | null = null
  export const deployment=(name:'test' | 'staging' | 'production' | 'development' | null = null)=>{
    if (name !== null && DEPLOYMENT === null) {
      DEPLOYMENT = name
    }
    return DEPLOYMENT ?? 'test'
  }
  
}