import * as Core from "../../../../core/module/types";
import * as Fields from "./fields";
import * as Status from "./status";
import * as Profile from "../profiles";
import { Type } from "./usertype";

export type Snippet = {
  id: Core.Entity.Id;
  first_name: Profile.Fields.FirstName;
  last_name: Profile.Fields.LastName;
  username: Fields.UniqueUsername;
  email_address: Fields.UniqueEmailAddress;
  is_email_verified: boolean;
  user_type: Type;
  status: Status.Type;
  profile_photo: Profile.Fields.Image | null;
  cover_photo: Profile.Fields.Image | null;
};
