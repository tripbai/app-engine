import * as fs from "fs";
import { injectable } from "inversify";
import { FirebaseProjectInterface } from "./firebase-project.interface";
import { FirebaseProjectConfig } from "./types";
import { appRoot } from "../../application/appRoot";
import { getEnvironmentContext } from "../../application/environmentContext";

@injectable()
export class FirebaseEnvBasedProjectService
  implements FirebaseProjectInterface
{
  getConfPath(): string {
    const root = appRoot();
    const environment = getEnvironmentContext();
    return `${root}/${environment}.firebase.config.json`;
  }

  getProjectId(): string {
    const config: FirebaseProjectConfig = JSON.parse(
      fs.readFileSync(this.getConfPath()).toString()
    );
    return config.project_id;
  }
}
