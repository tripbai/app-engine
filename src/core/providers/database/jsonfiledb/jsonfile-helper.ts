import { injectable } from "inversify";
import * as fs from "fs";
import { Application } from "../../../application";
const path = require('path')

// Serves as a flag to indicate if the data has been loaded
let __loaded = false

// Temporary storage for JSON data
let __snapshot: {[key:string]:{[key:string]:any}} = {}

@injectable()
export class JSONFileHelper {

  constructor (

  ) {}

  getSnapshot(){
    if (!__loaded) {
      const filepath = this.getDataPath()
      if (!fs.existsSync(filepath)) {
        this.createDataFile()
      }
      // Load data into snapshot
      __snapshot = JSON.parse(fs.readFileSync(filepath).toString())
      __loaded = true
    }
    return __snapshot
  }

  storeSnapshot(){
    const filepath = this.getDataPath()
    fs.writeFileSync(filepath, JSON.stringify(__snapshot))
  }

  createClone(data: {[key:string]:any}): {[key:string]:any} {
    return JSON.parse(JSON.stringify(data))
  }

  private createDataFile(){
    const filepath = this.getDataPath()
    fs.writeFileSync(filepath, JSON.stringify({}))
  }

  private getDataPath(): string {
    const rootDir = Application.root() + '/data'
    return path.join(rootDir, '.jsondb')
  }

}