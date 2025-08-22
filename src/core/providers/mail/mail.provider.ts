import * as Core from "../../module/types";

export abstract class AbstractMailProvider {
  abstract sendEmail(params: SendMailParams): Promise<void>;
}

export type SendMailParams = {
  sender_id: Core.Entity.Id;
  template_id: string;
  to_email: string;
  ccs?: Array<string> | null;
  variables: { [key: string]: any };
};
