import * as Status from "./status";
import * as Profile from "../profiles";
import * as Fields from "./fields";
import * as Core from "../../../../core/module/types";
import * as ApplicationAccess from "./access";
import * as Providers from "../providers";
import { Type } from "./usertype";
import { Snippet } from "./snippet";

export type Create = {
  request: {
    path: "/identity-authority/users";
    method: "POST";
    data: {
      type: "concrete";
      context: "external";
      provider: "iauth";
      role: "user";
      status: Status.Pick<"unverified">;
      first_name: Profile.Fields.FirstName;
      last_name: Profile.Fields.LastName;
      username: Fields.Username;
      email_address: Fields.EmailAddress;
      password: Fields.RawPassword;
    };
  };
  response: {
    type: Type;
    context: Fields.CreationContext;
    provider: Providers.Identity;
    role: Fields.Role;
    user_id: Core.Entity.Id;
    first_name: Profile.Fields.FirstName;
    last_name: Profile.Fields.LastName;
    username: Fields.UniqueUsername;
    email_address: Fields.UniqueEmailAddress;
    status: Status.Type;
    iauth_token: string;
  };
};
export type AccessReport = {
  request: {
    method: "POST";
    path: "/identity-authority/access-report";
    data: {
      provider: "iauth";
      email_address: Fields.EmailAddress;
      password: Fields.RawPassword;
    };
  };
  response: ApplicationAccess.Report;
};
export type GetSelf = {
  request: {
    method: "GET";
    path: "/identity-authority/user/me";
  };
  response: {
    entity_id: Core.Entity.Id;
    first_name: Profile.Fields.FirstName;
    last_name: Profile.Fields.LastName;
    profile_photo: Profile.Fields.Image | null;
    cover_photo: Profile.Fields.Image | null;
    about: string | null;
    username: Fields.UniqueUsername;
    email_address: Fields.UniqueEmailAddress;
    is_email_verified: boolean;
    user_type: Type;
    status: Status.Type;
    verified_since: string | null;
    role: "webadmin" | "user" | "moderator";
  };
};
export type GetModel = {
  request: {
    method: "GET";
    path: "/identity-authority/users/:user_id";
  };
  response: {
    identity_provider: Providers.Identity;
    email_address: Fields.UniqueEmailAddress;
    username: Fields.UniqueUsername;
    is_email_verified: boolean;
    verified_since: string | null;
    suspended_until: string | null;
    creation_context: "external" | "internal";
    role: "webadmin" | "user" | "moderator";
    status: Status.Type;
    type: Type;
  };
};
export type GetByEmailOrUsername = {
  request: {
    path: "/identity-authority/user/get/snippet?type=:type&value=:value";
    method: "GET";
  };
  response: Snippet;
};
export type UpdateUser = {
  request: {
    method: "PATCH";
    path: "/identity-authority/users/:user_id";
    data: {
      identity_provider?: Providers.Identity;
      first_name?: Profile.Fields.FirstName;
      last_name?: Profile.Fields.LastName;
      about?: string;
      profile_photo?: {
        upload_token: string;
      };
      cover_photo?: {
        upload_token: string;
      };
      password?: {
        reset_confirmation_token?: string;
        current_password?: Fields.RawPassword;
        new_password: Fields.RawPassword;
      };
      username?: Fields.Username;
      email_address?: {
        update_confirmation_token: string;
      };
      is_email_verified?: {
        verification_confirmation_token: string;
      };
      type?: Type;
    };
  };
  response: {};
};
export type UpdateUserStatus = {
  request: {
    method: "POST";
    path: "/identity-authority/user/moderate/status";
    data:
      | {
          user_id: Core.Entity.Id;
          status: Status.Disregard<"suspended">;
        }
      | {
          user_id: Core.Entity.Id;
          status: Status.Pick<"suspended">;
          suspend_until: string;
        };
  };
  response: {};
};
export type UpdateUserRole = {
  request: {
    method: "POST";
    path: "/identity-authority/user/delegate/role";
    data: {
      user_id: Core.Entity.Id;
      role: "webadmin" | "moderator" | "user";
    };
  };
  response: {};
};
export type SendEmailForAccountVerification = {
  request: {
    method: "POST";
    path: "/identity-authority/user/send-account-verification-email";
  };
  response: {};
};
export type SendEmailForPasswordReset = {
  request: {
    method: "POST";
    path: "/identity-authority/user/send-password-reset-email";
    data: {
      email_address: Fields.EmailAddress;
    };
  };
  response: {};
};
export type SendEmailForNewEmailConfirmation = {
  request: {
    method: "POST";
    path: "/identity-authority/user/send-new-email-confirmation";
    data: {
      email_address: Fields.EmailAddress;
    };
  };
  response: {};
};
export type MFAValidateOTP = {
  request: {
    path: "/identity-authority/users/mfa/otp/validate";
    method: "POST";
    data: {
      user_id: Core.Entity.Id;
      otp: string;
    };
  };
  response: ApplicationAccess.Report;
};
export type UploadImage = {
  request: {
    path: "/identity-authority/users/:user_id/images/upload";
    method: "POST";
    data: {
      file: File;
      type: "profile_photo" | "cover_photo";
    };
  };
  response: {
    relative_path: Core.Uploads.FilePath;
    upload_token: string;
  };
};
export type RefreshAccessToken = {
  request: {
    path: "/identity-authority/tokens/refresh";
    method: "POST";
  };
  response: {
    token: string;
  };
};
