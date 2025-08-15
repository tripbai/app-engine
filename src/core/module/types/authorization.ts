import * as User from "./user";

/**
 * A permission token with placeholders. For example,
 * user:{user_id}.
 * This token needs to be populated with data first
 * before this can be validated
 */
export type AbstractToken = string & {
  delimiter: ":";
  placeholders: true;
};

/**
 * A permission token with actual values. For example,
 * user:sampleuserid
 */
export type ConcreteToken = string & {
  delimiter: ":";
  placeholders: false;
};

/**
 * An actor or a requester to an API call. The Requester
 * object holds different data, such as, the id and status of
 * the User (Requester)
 */
export type Requester = {
  readonly user: User.Data | null;
  readonly permissions: Array<ConcreteToken>;
  readonly ipAddress: string;
  readonly userAgent: string;
};

export type RequesterTokenPayload = {
  user: { id: string; status: string };
  permissions: Array<ConcreteToken>;
};
