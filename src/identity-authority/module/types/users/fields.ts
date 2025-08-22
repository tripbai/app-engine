/** A valid email address, but may not be unique */
export type EmailAddress = string & {
  minLen: 8;
  maxLen: 64;
  verifiedUnique: false;
  key: "email_address";
};
/** A valid email address, and certified unique throughout the application */
export type UniqueEmailAddress = string & {
  minLen: 8;
  maxLen: 64;
  verifiedUnique: true;
  key: "email_address";
};
/** A valid username, but may not be unique */
export type Username = string & {
  minLen: 5;
  maxLen: 32;
  verifiedUnique: false;
  key: "username";
};
/** A valid username, and certified unique throughout the application */
export type UniqueUsername = string & {
  minLen: 5;
  maxLen: 32;
  verifiedUnique: true;
  key: "username";
};
export type RawPassword = string & {
  minLen: 8;
  maxLen: 64;
  key: "raw_password";
};
export type HashedPassword = string & {
  minLen: 8;
  maxLen: 64;
  key: "hashed_password";
};
export type Role = "webadmin" | "user" | "moderator";
export type CreationContext = "external" | "internal";
