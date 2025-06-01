import * as fs from "fs"
import { injectable } from "inversify";
import { FirebaseProjectInterface } from "./firebase-project.interface";
import { Application } from "../../application";
import { FirebaseProjectConfig } from "./types";

@injectable()
export class FirebaseEnvBasedProjectService implements FirebaseProjectInterface {

  getConfPath(): string {
    const root = Application.root()
    const environment = Application.environment()
    return `${root}/${environment}.firebase.config.json`
  }

  getProjectId(): string {
    const config: FirebaseProjectConfig 
      = JSON.parse(fs.readFileSync(this.getConfPath()).toString())
    return config.project_id
  }

}