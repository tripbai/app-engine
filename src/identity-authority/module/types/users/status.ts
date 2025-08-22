export type Type =
  | "active"
  | "unverified"
  | "banned"
  | "deactivated"
  | "archived"
  | "suspended";
export type Pick<T extends Type> = T;
export type Disregard<T extends Type> = Exclude<Type, T>;
